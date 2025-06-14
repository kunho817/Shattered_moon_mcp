"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPrompts = setupPrompts;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_js_1 = require("../types/index.js");
const services_js_1 = require("../server/services.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
async function setupPrompts(server) {
    const prompts = [];
    // 1. Code Generation Prompt
    prompts.push({
        name: 'generate_code',
        description: 'Generate optimized DirectX 12 game engine code with AI assistance',
        arguments: [
            {
                name: 'task',
                description: 'What type of code to generate',
                required: true
            },
            {
                name: 'context',
                description: 'Additional context about the code requirements',
                required: false
            },
            {
                name: 'style',
                description: 'Coding style preferences',
                required: false
            }
        ]
    });
    // 2. Task Planning Prompt
    prompts.push({
        name: 'plan_task',
        description: 'AI-powered task planning and team coordination',
        arguments: [
            {
                name: 'task',
                description: 'Task description to plan',
                required: true
            },
            {
                name: 'context',
                description: 'Project context and constraints',
                required: false
            }
        ]
    });
    // 3. Optimization Prompt
    prompts.push({
        name: 'optimize_performance',
        description: 'Performance optimization recommendations',
        arguments: [
            {
                name: 'context',
                description: 'Performance context (code, system, architecture)',
                required: true
            },
            {
                name: 'style',
                description: 'Optimization style (aggressive, conservative, balanced)',
                required: false
            }
        ]
    });
    // 4. Debug Analysis Prompt
    prompts.push({
        name: 'analyze_issue',
        description: 'AI-powered issue analysis and debugging suggestions',
        arguments: [
            {
                name: 'task',
                description: 'Description of the issue or error',
                required: true
            },
            {
                name: 'context',
                description: 'Error context, logs, or environment details',
                required: false
            }
        ]
    });
    // 5. Architecture Review Prompt
    prompts.push({
        name: 'review_architecture',
        description: 'Architecture review and improvement suggestions',
        arguments: [
            {
                name: 'context',
                description: 'Architecture or system to review',
                required: true
            },
            {
                name: 'style',
                description: 'Review focus (scalability, performance, maintainability)',
                required: false
            }
        ]
    });
    // Set up prompt handlers
    server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const { stateManager } = (0, services_js_1.getServices)();
        logger_js_1.default.info(`Getting prompt: ${name}`, { args });
        const validatedArgs = index_js_1.PromptArgumentsSchema.parse(args || {});
        try {
            switch (name) {
                case 'generate_code':
                    return {
                        description: `AI-powered code generation for DirectX 12 game engine`,
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `Generate ${validatedArgs.task || 'DirectX 12 engine code'} with the following requirements:

**Context**: ${validatedArgs.context || 'Modern DirectX 12 game engine development'}
**Style**: ${validatedArgs.style || 'Clean, optimized, production-ready'}

**Requirements**:
- Memory-efficient and cache-friendly design
- Follow modern C++ best practices
- Include proper error handling
- Optimize for DirectX 12 pipeline
- Add comprehensive comments
- Consider performance implications

**Additional Guidelines**:
- Use Entity-Component-System (ECS) architecture where applicable
- Implement proper resource management
- Consider multithreading and parallel execution
- Follow RAII principles
- Use smart pointers appropriately

Please provide complete, compilable code with explanations.`
                                }
                            }
                        ]
                    };
                case 'plan_task':
                    // Task planning prompt template replaced by Claude Code analysis
                    logger_js_1.default.info('Task planning prompt requested', {
                        description: validatedArgs.task || '',
                        keywords: (validatedArgs.task || '').split(' ')
                    });
                    return {
                        description: `AI-powered task planning and team coordination`,
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `Plan the following task with AI assistance:

**Task**: ${validatedArgs.task || 'Task planning'}
**Context**: ${validatedArgs.context || 'DirectX 12 game engine development'}

**AI Analysis**:
- Estimated Complexity: Medium
- Suggested Teams: Planning, Backend
- Estimated Duration: 60 minutes

**Planning Requirements**:
1. Break down the task into manageable subtasks
2. Identify dependencies and prerequisites
3. Assign appropriate teams and specialists
4. Estimate time and resource requirements
5. Identify potential risks and mitigation strategies
6. Create a clear execution timeline

**Current Project State**:
- Active Teams: ${Array.from(stateManager.getState().teams.keys()).join(', ')}
- Available Specialists: ${stateManager.getAvailableSpecialists().length}
- Team Utilization: Balanced

Please provide a detailed execution plan with clear next steps.`
                                }
                            }
                        ]
                    };
                case 'optimize_performance':
                    const performanceContext = validatedArgs.context || 'general performance';
                    const style = validatedArgs.style || 'balanced';
                    return {
                        description: `Performance optimization recommendations`,
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `Provide performance optimization recommendations for:

**Context**: ${performanceContext}
**Optimization Style**: ${style}

**Focus Areas**:
1. **Memory Optimization**:
   - Memory allocation patterns
   - Cache-friendly data structures
   - Memory pool utilization

2. **CPU Optimization**:
   - Algorithm efficiency
   - Multithreading opportunities
   - Branch prediction optimization

3. **GPU Optimization**:
   - DirectX 12 pipeline efficiency
   - Shader optimization
   - Resource binding optimization

4. **I/O Optimization**:
   - Async operations
   - Batch processing
   - Resource streaming

**Optimization Approach**:
- ${style === 'aggressive' ? 'Maximize performance regardless of complexity' :
                                        style === 'conservative' ? 'Safe optimizations with minimal risk' :
                                            'Balance performance gains with code maintainability'}

Please provide specific, actionable recommendations with code examples where applicable.`
                                }
                            }
                        ]
                    };
                case 'analyze_issue':
                    return {
                        description: `AI-powered issue analysis and debugging`,
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `Analyze the following issue with AI debugging assistance:

**Issue**: ${validatedArgs.task || 'Debugging analysis'}
**Context**: ${validatedArgs.context || 'DirectX 12 game engine environment'}

**Analysis Framework**:
1. **Root Cause Analysis**:
   - Identify potential causes
   - Trace the issue back to its source
   - Consider environmental factors

2. **Impact Assessment**:
   - Evaluate severity and scope
   - Identify affected systems
   - Assess performance implications

3. **Resolution Strategy**:
   - Immediate fixes
   - Long-term solutions
   - Prevention measures

4. **Testing Approach**:
   - Reproduction steps
   - Validation methods
   - Regression testing

**Debugging Tools**:
- Visual Studio Debugger
- DirectX Graphics Debugger
- Performance profilers
- Memory analyzers

Please provide a systematic debugging approach with specific steps and tools.`
                                }
                            }
                        ]
                    };
                case 'review_architecture':
                    const reviewContext = validatedArgs.context || 'DirectX 12 game engine architecture';
                    const reviewFocus = validatedArgs.style || 'overall';
                    return {
                        description: `Architecture review and improvement suggestions`,
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `Review the following architecture with AI assistance:

**Architecture**: ${reviewContext}
**Review Focus**: ${reviewFocus}

**Review Criteria**:
1. **Scalability**:
   - Horizontal and vertical scaling
   - Load distribution
   - Resource utilization

2. **Performance**:
   - Latency optimization
   - Throughput maximization
   - Resource efficiency

3. **Maintainability**:
   - Code organization
   - Modularity and coupling
   - Documentation quality

4. **Reliability**:
   - Error handling
   - Fault tolerance
   - Recovery mechanisms

5. **Security**:
   - Input validation
   - Resource protection
   - Access control

**Architecture Patterns**:
- Entity-Component-System (ECS)
- Command pattern for graphics
- Observer pattern for events
- Object pooling for memory management

**Evaluation Focus**: ${reviewFocus === 'scalability' ? 'Ability to handle increasing load and complexity' :
                                        reviewFocus === 'performance' ? 'Execution speed and resource efficiency' :
                                            reviewFocus === 'maintainability' ? 'Code quality and long-term sustainability' :
                                                'Comprehensive architecture assessment'}

Please provide detailed feedback with specific improvement recommendations.`
                                }
                            }
                        ]
                    };
                default:
                    throw new Error(`Unknown prompt: ${name}`);
            }
        }
        catch (error) {
            logger_js_1.default.error('Prompt generation error', { name, error });
            throw error;
        }
    });
    return prompts;
}
//# sourceMappingURL=index.js.map