"use strict";
/**
 * Zod to JSON Schema converter for MCP compliance
 * Ensures consistent schema definitions between Zod validation and MCP tool schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodToJsonSchema = zodToJsonSchema;
exports.validateMcpToolSchema = validateMcpToolSchema;
exports.createMcpTool = createMcpTool;
const zod_1 = require("zod");
/**
 * Convert Zod schema to JSON Schema format for MCP tools
 */
function zodToJsonSchema(zodSchema) {
    // Handle object schema
    if (zodSchema instanceof zod_1.z.ZodObject) {
        const shape = zodSchema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = convertZodType(value);
            // Check if field is required (not optional)
            if (!value.isOptional()) {
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
function convertZodType(zodType) {
    // Handle optional types
    if (zodType instanceof zod_1.z.ZodOptional) {
        return convertZodType(zodType.unwrap());
    }
    // Handle default types
    if (zodType instanceof zod_1.z.ZodDefault) {
        const schema = convertZodType(zodType.removeDefault());
        return {
            ...schema,
            default: zodType._def.defaultValue()
        };
    }
    // Handle string types
    if (zodType instanceof zod_1.z.ZodString) {
        const schema = { type: 'string' };
        // Add description if available
        if (zodType.description) {
            schema.description = zodType.description;
        }
        return schema;
    }
    // Handle number types
    if (zodType instanceof zod_1.z.ZodNumber) {
        const schema = { type: 'number' };
        // Add min/max constraints
        for (const check of zodType._def.checks) {
            if (check.kind === 'min') {
                schema.minimum = check.value;
            }
            else if (check.kind === 'max') {
                schema.maximum = check.value;
            }
        }
        if (zodType.description) {
            schema.description = zodType.description;
        }
        return schema;
    }
    // Handle boolean types
    if (zodType instanceof zod_1.z.ZodBoolean) {
        const schema = { type: 'boolean' };
        if (zodType.description) {
            schema.description = zodType.description;
        }
        return schema;
    }
    // Handle enum types
    if (zodType instanceof zod_1.z.ZodEnum) {
        const schema = {
            type: 'string',
            enum: zodType.options
        };
        if (zodType.description) {
            schema.description = zodType.description;
        }
        return schema;
    }
    // Handle array types
    if (zodType instanceof zod_1.z.ZodArray) {
        const schema = {
            type: 'array',
            items: convertZodType(zodType.element)
        };
        if (zodType.description) {
            schema.description = zodType.description;
        }
        return schema;
    }
    // Handle object types
    if (zodType instanceof zod_1.z.ZodObject) {
        return zodToJsonSchema(zodType);
    }
    // Handle union types (simplified)
    if (zodType instanceof zod_1.z.ZodUnion) {
        const options = zodType.options;
        if (options.every((opt) => opt instanceof zod_1.z.ZodLiteral)) {
            return {
                type: 'string',
                enum: options.map((opt) => opt.value)
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
function validateMcpToolSchema(schema) {
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
function createMcpTool(name, description, zodSchema, handler) {
    return {
        name,
        description,
        inputSchema: zodToJsonSchema(zodSchema),
        handler
    };
}
//# sourceMappingURL=schema-converter.js.map