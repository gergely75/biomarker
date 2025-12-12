import OpenAI from "openai";
import { Patient, Biomarker } from "../../../types";

export class AIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });
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
}
