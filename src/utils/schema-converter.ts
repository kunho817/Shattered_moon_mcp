/**
 * Zod to JSON Schema converter for MCP compliance
 * Ensures consistent schema definitions between Zod validation and MCP tool schemas
 */

import { z } from 'zod';

/**
 * Convert Zod schema to JSON Schema format for MCP tools
 */
export function zodToJsonSchema(zodSchema: z.ZodSchema): any {
  // Handle object schema
  if (zodSchema instanceof z.ZodObject) {
    const shape = zodSchema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = convertZodType(value as z.ZodTypeAny);
      
      // Check if field is required (not optional)
      if (!(value as z.ZodTypeAny).isOptional()) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  }

  return convertZodType(zodSchema);
}

/**
 * Convert individual Zod types to JSON Schema types
 */
function convertZodType(zodType: z.ZodTypeAny): any {
  // Handle optional types
  if (zodType instanceof z.ZodOptional) {
    return convertZodType(zodType.unwrap());
  }

  // Handle default types
  if (zodType instanceof z.ZodDefault) {
    const schema = convertZodType(zodType.removeDefault());
    return {
      ...schema,
      default: zodType._def.defaultValue()
    };
  }

  // Handle string types
  if (zodType instanceof z.ZodString) {
    const schema: any = { type: 'string' };
    
    // Add description if available
    if (zodType.description) {
      schema.description = zodType.description;
    }
    
    return schema;
  }

  // Handle number types
  if (zodType instanceof z.ZodNumber) {
    const schema: any = { type: 'number' };
    
    // Add min/max constraints
    for (const check of zodType._def.checks) {
      if (check.kind === 'min') {
        schema.minimum = check.value;
      } else if (check.kind === 'max') {
        schema.maximum = check.value;
      }
    }
    
    if (zodType.description) {
      schema.description = zodType.description;
    }
    
    return schema;
  }

  // Handle boolean types
  if (zodType instanceof z.ZodBoolean) {
    const schema: any = { type: 'boolean' };
    if (zodType.description) {
      schema.description = zodType.description;
    }
    return schema;
  }

  // Handle enum types
  if (zodType instanceof z.ZodEnum) {
    const schema: any = {
      type: 'string',
      enum: zodType.options
    };
    if (zodType.description) {
      schema.description = zodType.description;
    }
    return schema;
  }

  // Handle array types
  if (zodType instanceof z.ZodArray) {
    const schema: any = {
      type: 'array',
      items: convertZodType(zodType.element)
    };
    if (zodType.description) {
      schema.description = zodType.description;
    }
    return schema;
  }

  // Handle object types
  if (zodType instanceof z.ZodObject) {
    return zodToJsonSchema(zodType);
  }

  // Handle union types (simplified)
  if (zodType instanceof z.ZodUnion) {
    const options = zodType.options;
    if (options.every((opt: z.ZodTypeAny) => opt instanceof z.ZodLiteral)) {
      return {
        type: 'string',
        enum: options.map((opt: z.ZodLiteral<any>) => opt.value)
      };
    }
  }

  // Fallback for unknown types
  console.warn(`Unsupported Zod type: ${zodType.constructor.name}`);
  return { type: 'string' };
}

/**
 * Validate MCP tool schema format
 */
export function validateMcpToolSchema(schema: any): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  // Check required properties for MCP tool schema
  if (schema.type !== 'object') {
    return false;
  }

  if (!schema.properties || typeof schema.properties !== 'object') {
    return false;
  }

  return true;
}

/**
 * Create MCP-compliant tool definition
 */
export function createMcpTool(
  name: string,
  description: string,
  zodSchema: z.ZodSchema,
  handler: (params: any) => Promise<any>
) {
  return {
    name,
    description,
    inputSchema: zodToJsonSchema(zodSchema),
    handler
  };
}