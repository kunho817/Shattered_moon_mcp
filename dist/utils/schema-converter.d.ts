/**
 * Zod to JSON Schema converter for MCP compliance
 * Ensures consistent schema definitions between Zod validation and MCP tool schemas
 */
import { z } from 'zod';
/**
 * Convert Zod schema to JSON Schema format for MCP tools
 */
export declare function zodToJsonSchema(zodSchema: z.ZodSchema): any;
/**
 * Validate MCP tool schema format
 */
export declare function validateMcpToolSchema(schema: any): boolean;
/**
 * Create MCP-compliant tool definition
 */
export declare function createMcpTool(name: string, description: string, zodSchema: z.ZodSchema, handler: (params: any) => Promise<any>): {
    name: string;
    description: string;
    inputSchema: any;
    handler: (params: any) => Promise<any>;
};
//# sourceMappingURL=schema-converter.d.ts.map