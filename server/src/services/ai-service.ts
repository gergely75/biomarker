import OpenAI from "openai";
import { Patient, Biomarker } from "../../../types";
import { MCPService } from "./mcp-service";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AIService {
  private client: OpenAI;
  private mcpService: MCPService | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  setMCPService(mcpService: MCPService) {
    this.mcpService = mcpService;
  }

  async getInsights(
    patient: Patient,
    biomarkers: Biomarker[]
  ): Promise<string> {
    try {
      // Prepare the prompt with patient context
      const prompt = this.buildPrompt(patient, biomarkers);

      // Call the LLM
      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo", // Using 3.5 for cost efficiency, change to 'gpt-4' for better quality
        messages: [
          {
            role: "system",
            content: `You are a medical AI assistant analyzing patient biomarker data. 
Provide clear, actionable insights based on the biomarker results. 
Be professional and informative. Include:
1. Overall health assessment
2. Areas of concern (if any)
3. Recommendations
4. Suggested follow-ups

Keep responses concise (300-400 words). Use markdown formatting for better readability.
Add a medical disclaimer at the end.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0].message.content || "No insights generated";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(
        "Failed to generate AI insights. Please check your API key and try again."
      );
    }
  }

  private buildPrompt(patient: Patient, biomarkers: Biomarker[]): string {
    // Calculate age from date of birth
    const birthDate = new Date(patient.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Group biomarkers by category
    const byCategory: { [key: string]: Biomarker[] } = {};
    biomarkers.forEach((b) => {
      if (!byCategory[b.category]) {
        byCategory[b.category] = [];
      }
      byCategory[b.category].push(b);
    });

    // Build biomarker summary with categories
    let biomarkerSummary = "";
    Object.keys(byCategory).forEach((category) => {
      biomarkerSummary += `\n**${
        category.charAt(0).toUpperCase() + category.slice(1)
      } Biomarkers:**\n`;
      byCategory[category].forEach((b) => {
        const status =
          b.status === "normal" ? "✓" : b.status === "high" ? "↑" : "↓";
        biomarkerSummary += `  ${status} ${b.name}: ${b.value} ${
          b.unit
        } (Normal: ${b.referenceRange.min}-${
          b.referenceRange.max
        }) - ${b.status.toUpperCase()}\n`;
      });
    });

    return `
Analyze the following patient biomarker results:

**Patient Information:**
- Age: ${age} years

**Biomarker Results:**
${biomarkerSummary}

Please provide a comprehensive health analysis based on these results.
    `.trim();
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      if (!this.mcpService) {
        throw new Error("MCP Service not initialized");
      }

      // Define the tools available to the AI
      const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
          type: "function",
          function: {
            name: "get_all_patients",
            description: "Retrieve a list of all patients with their basic information",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_patient",
            description: "Get detailed information about a specific patient by their ID",
            parameters: {
              type: "object",
              properties: {
                patient_id: {
                  type: "number",
                  description: "The unique identifier of the patient",
                },
              },
              required: ["patient_id"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_patient_biomarkers",
            description: "Retrieve all biomarker measurements for a specific patient",
            parameters: {
              type: "object",
              properties: {
                patient_id: {
                  type: "number",
                  description: "The unique identifier of the patient",
                },
                category: {
                  type: "string",
                  description: "Optional: Filter by category (metabolic, cardiovascular, hormonal)",
                  enum: ["metabolic", "cardiovascular", "hormonal"],
                },
              },
              required: ["patient_id"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "search_patients",
            description: "Search for patients by name",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query to match against patient names",
                },
              },
              required: ["query"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "analyze_biomarker_trends",
            description: "Analyze biomarker trends and identify abnormal values for a patient",
            parameters: {
              type: "object",
              properties: {
                patient_id: {
                  type: "number",
                  description: "The unique identifier of the patient",
                },
              },
              required: ["patient_id"],
            },
          },
        },
      ];

      const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
        {
          role: "system",
          content: `You are a medical AI assistant with access to patient biomarker data. 
You can help users:
- Find and list patients
- View patient information and biomarker results
- Analyze biomarker trends
- Provide health insights based on biomarker data

Use the available tools to fetch data when needed. Be professional, informative, and helpful.
Always include relevant details from the data when providing analysis.

When discussing biomarker results:
- Explain what abnormal values might indicate
- Provide context about reference ranges
- Suggest potential follow-up actions

Add appropriate medical disclaimers when providing health advice.`,
        };

      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [systemMessage, ...messages];

      let response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
      });

      // Handle tool calls
      let iterations = 0;
      const maxIterations = 5;

      while (
        response.choices[0].message.tool_calls &&
        iterations < maxIterations
      ) {
        iterations++;

        const assistantMessage = response.choices[0].message;
        chatMessages.push(assistantMessage);

        // Execute each tool call
        if (assistantMessage.tool_calls) {
          for (const toolCall of assistantMessage.tool_calls) {
            if (toolCall.type !== 'function') continue;
            
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(
            `Executing MCP tool: ${functionName} with args:`,
            functionArgs
          );

          try {
            const result = await this.mcpService.executeTool(
              functionName,
              functionArgs
            );
            const resultText =
              result.content[0]?.text || JSON.stringify(result);

            chatMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: resultText,
            });
          } catch (error: any) {
            chatMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Error: ${error.message}`,
            });
          }
        }
        }

        // Get next response from AI
        response = await this.client.chat.completions.create({
          model: "gpt-4o",
          messages: chatMessages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
        });
      }

      return (
        response.choices[0].message.content ||
        "I apologize, but I couldn't generate a response."
      );
    } catch (error) {
      console.error("Chat Error:", error);
      throw new Error(
        "Failed to process chat message. Please check your API key and try again."
      );
    }
  }
}
