import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Patient, Biomarker } from "../../../types";

export class MCPService {
  private server: Server;
  private patients: Patient[];
  private biomarkers: Biomarker[];

  constructor(patients: Patient[], biomarkers: Biomarker[]) {
    this.patients = patients;
    this.biomarkers = biomarkers;
    
    this.server = new Server(
      {
        name: "biomarkers-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  // Tool execution methods
  private getAllPatientsData() {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(this.patients, null, 2),
        },
      ],
    };
  }

  private getPatientData(patientId: number) {
    const patient = this.patients.find((p) => p.id === patientId);
    
    if (!patient) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Patient with ID ${patientId} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(patient, null, 2),
        },
      ],
    };
  }

  private getPatientBiomarkersData(patientId: number, category?: string) {
    let patientBiomarkers = this.biomarkers.filter(
      (b) => b.patientId === patientId
    );

    if (category) {
      patientBiomarkers = patientBiomarkers.filter(
        (b) => b.category === category
      );
    }

    if (patientBiomarkers.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No biomarkers found for patient ${patientId}${
              category ? ` in category ${category}` : ""
            }`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(patientBiomarkers, null, 2),
        },
      ],
    };
  }

  private searchPatientsData(query: string) {
    const lowerQuery = query.toLowerCase();
    const results = this.patients.filter((p) =>
      p.name.toLowerCase().includes(lowerQuery)
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private analyzeBiomarkerTrendsData(patientId: number) {
    const patient = this.patients.find((p) => p.id === patientId);
    
    if (!patient) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Patient with ID ${patientId} not found`,
          },
        ],
        isError: true,
      };
    }

    const patientBiomarkers = this.biomarkers.filter(
      (b) => b.patientId === patientId
    );

    if (patientBiomarkers.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No biomarkers found for patient ${patientId}`,
          },
        ],
      };
    }

    // Analyze abnormal values
    const abnormal = patientBiomarkers.filter(
      (b) => b.status !== "normal"
    );
    const byCategory = patientBiomarkers.reduce((acc, b) => {
      if (!acc[b.category]) acc[b.category] = [];
      acc[b.category].push(b);
      return acc;
    }, {} as Record<string, Biomarker[]>);

    const analysis = {
      patient: patient,
      total_biomarkers: patientBiomarkers.length,
      abnormal_count: abnormal.length,
      abnormal_biomarkers: abnormal,
      by_category: byCategory,
      summary: {
        normal: patientBiomarkers.filter((b) => b.status === "normal")
          .length,
        high: patientBiomarkers.filter((b) => b.status === "high")
          .length,
        low: patientBiomarkers.filter((b) => b.status === "low").length,
      },
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "get_all_patients",
          description: "Retrieve a list of all patients with their basic information (id, name, date of birth, last visit)",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_patient",
          description: "Get detailed information about a specific patient by their ID",
          inputSchema: {
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
        {
          name: "get_patient_biomarkers",
          description: "Retrieve all biomarker measurements for a specific patient. Optionally filter by category (metabolic, cardiovascular, hormonal)",
          inputSchema: {
            type: "object",
            properties: {
              patient_id: {
                type: "number",
                description: "The unique identifier of the patient",
              },
              category: {
                type: "string",
                description: "Optional: Filter by biomarker category (metabolic, cardiovascular, hormonal)",
                enum: ["metabolic", "cardiovascular", "hormonal"],
              },
            },
            required: ["patient_id"],
          },
        },
        {
          name: "search_patients",
          description: "Search for patients by name (case-insensitive partial match)",
          inputSchema: {
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
        {
          name: "analyze_biomarker_trends",
          description: "Analyze biomarker trends and identify abnormal values for a patient",
          inputSchema: {
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
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_all_patients":
            return this.getAllPatientsData();

          case "get_patient":
            return this.getPatientData(args?.patient_id as number);

          case "get_patient_biomarkers":
            return this.getPatientBiomarkersData(
              args?.patient_id as number,
              args?.category as string | undefined
            );

          case "search_patients":
            return this.searchPatientsData((args?.query as string) || "");

          case "analyze_biomarker_trends":
            return this.analyzeBiomarkerTrendsData(args?.patient_id as number);

          default:
            return {
              content: [
                {
                  type: "text",
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Biomarkers Server running on stdio");
  }

  getServer() {
    return this.server;
  }

  // Method to execute tools programmatically (for HTTP API)
  async executeTool(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case "get_all_patients":
          return this.getAllPatientsData();

        case "get_patient":
          return this.getPatientData(args?.patient_id as number);

        case "get_patient_biomarkers":
          return this.getPatientBiomarkersData(
            args?.patient_id as number,
            args?.category as string | undefined
          );

        case "search_patients":
          return this.searchPatientsData((args?.query as string) || "");

        case "analyze_biomarker_trends":
          return this.analyzeBiomarkerTrendsData(args?.patient_id as number);

        default:
          return {
            content: [
              {
                type: "text",
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool ${name}: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
}

