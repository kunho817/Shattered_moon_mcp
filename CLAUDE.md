# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **TypeScript implementation** of Shattered Moon MCP (Model Context Protocol) server, a production-ready development assistant specifically designed for DirectX 12 game engine development. Built using the official @modelcontextprotocol/sdk for maximum compatibility.

**Current Status**: ✅ **Production Ready** - Complete TypeScript rewrite with enhanced features and compatibility

## Recent Development Updates

### 🚀 Claude Code Integration (Latest)
- **Major Architecture Shift**: Migrated from internal AI to Claude Code bash integration
- **Intelligent Model Selection**: Opus for planning, Sonnet for execution
- **Advanced Performance Monitoring**: Real-time Claude Code usage analytics
- **Enhanced Accuracy**: Target 95%+ vs previous 87.99% internal AI accuracy

### Previous Updates
- Completed comprehensive TypeScript implementation
- Enhanced MCP server architecture with dual transport support
- Implemented advanced tool configuration and security layers
- Developed virtual teams system with specialized capabilities
- Added robust performance monitoring and error handling mechanisms

## Essential Commands

### Development
```bash
# Build the project (TypeScript compilation)
npm run build

# Development mode with TypeScript execution
npm run dev

# Watch mode for continuous development
npm run watch

# Type checking without compilation
npm run lint

# Start production server (requires build first)
npm start

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Run all tests
npm test

# Watch tests during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Architecture

### Core Server Structure

The server follows a layered architecture built on the MCP SDK:

```typescript
// Entry point: src/index.ts
ShatteredMoonMCPServer -> TransportManager -> MCP SDK Server
```

### Key Services (src/server/services.ts)

All tools share these centralized services:
- **ProjectStateManager**: Team, task, and specialist state management
- **PerformanceMonitor**: Real-time metrics and optimization tracking
- **AILearningEngine**: Pattern recognition and recommendation system
- **SessionManager**: Client session lifecycle management
- **StateManager**: Namespaced state with persistence and TTL

### Transport Layer Architecture

Dual transport support with automatic fallback:
- **stdio**: Primary transport for Claude Desktop integration
- **HTTP**: Fallback with SSE support for web clients
- **Auto-detection**: Automatically selects appropriate transport

### Tool Implementation Pattern

All 9 tools follow consistent patterns in `src/tools/`:

1. **Zod Schema Validation**: Defined in `src/types/index.ts`
2. **Service Integration**: Access shared services via `getServices()`
3. **Claude Code Integration**: External AI via bash calls with model selection
4. **Performance Monitoring**: Wrapped execution with metrics + Claude Code monitoring
5. **Error Handling**: Standardized error responses with suggestions
6. **AI Learning**: Pattern recording for optimization

### Claude Code Integration Architecture

**Key Tools Enhanced**:
- `distributedTaskManager`: Opus for task analysis, Sonnet for predictions
- `teamCoordinator`: Opus for conflict resolution, Sonnet for coordination
- `dynamicTeamExpander`: Auto model selection based on task complexity
- `performanceMetrics`: Real-time Claude Code performance analytics

**Performance Features**:
- Automatic model selection (planning tasks → Opus, execution → Sonnet)
- Response caching with 5-minute TTL
- Real-time performance monitoring and alerting
- Comprehensive usage analytics and recommendations

### GitHub Manager Enhanced Features

The GitHub tool (`src/tools/githubManager.ts`) implements:
- **HTTPS/SSH Auto-switching**: Automatic authentication fallback
- **Real Git Operations**: Direct command execution (not simulation)
- **Extended Actions**: status, branch, tag, release, workflow management
- **Smart Error Recovery**: Context-aware suggestions for common issues

## TypeScript Configuration

### Module System
- **Target**: ES2022 with CommonJS modules
- **Strict Mode**: Full TypeScript strict checking enabled
- **Source Maps**: Enabled for debugging
- **Declaration Files**: Generated for external consumption

### Import Strategy
Files use `.js` extensions in imports for CommonJS compatibility:
```typescript
import { getServices } from '../server/services.js';
```

## Security Architecture

Multi-layered security implementation:
- **Rate Limiting**: Configurable per-client limits
- **Input Validation**: Zod schemas for all tool parameters
- **Circuit Breakers**: Tool isolation and failure protection
- **Injection Protection**: XSS, SQL, command, and path traversal detection

## State Management

### Project State (ProjectStateManager)
- Virtual teams with status tracking
- Task lifecycle management
- Specialist allocation and performance metrics
- Automatic persistence every 30 seconds

### Session State (SessionManager)
- Client session isolation
- Automatic cleanup and expiration
- Configurable duration and limits

### Global State (StateManager)
Namespaced state with different persistence strategies:
- `sessions`: Persistent client sessions
- `cache`: Non-persistent with 1-hour TTL
- `user_preferences`: Persistent user settings
- `temp`: Short-lived data with 5-minute TTL

## Tool Configuration

### GitHub Integration
Set environment variables for enhanced functionality:
```bash
GITHUB_TOKEN=your_personal_access_token  # For API operations
```

### Development Environment
```bash
NODE_ENV=development    # Enables CORS and verbose logging
LOG_LEVEL=info         # Logging verbosity
HTTP_PORT=3000         # HTTP transport port
```

## Testing Strategy

### Jest Configuration
- **Preset**: `ts-jest` with ESM support
- **Environment**: Node.js
- **Coverage**: Excludes type definitions and test files
- **Module Mapping**: Handles `.js` import extensions

### Test Structure
```bash
test/              # Test files
src/**/*.test.ts   # Co-located unit tests
src/**/*.spec.ts   # Integration tests
```

## Resource and Prompt System

### Resources (src/resources/index.ts)
Dynamic resources with URI patterns:
- `shattered://teams` - Virtual team status
- `shattered://project/state` - Project metadata
- `shattered://performance` - Real-time metrics

### Prompts (src/prompts/index.ts)
AI-powered prompt templates:
- `generate_code` - DirectX 12 code generation
- `plan_task` - Intelligent task planning
- `optimize_performance` - Performance recommendations

## Virtual Teams System

Seven specialized teams with defined capabilities:
- **Planning**: Game design, UX research, product management
- **Backend**: ECS specialists, memory experts, algorithm specialists
- **Frontend**: DirectX 12 specialists, shader wizards, graphics engineers
- **Testing**: QA engineers, performance testers, automation specialists
- **Documentation**: Technical writers, API documenters, tutorial creators
- **Performance**: Profiler experts, optimization specialists, benchmark analysts
- **DevOps**: CI/CD engineers, deployment specialists, release managers

## Performance Monitoring

Real-time tracking of:
- Tool execution times and success rates
- Memory usage and resource utilization
- Team workload distribution
- AI pattern recognition effectiveness

## Integration Notes

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "shattered-moon-mcp": {
      "command": "node",
      "args": ["path/to/shattered_moon_mcp_ts/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Development Workflow
1. Use `npm run watch` for continuous development
2. Run `npm run lint` to catch TypeScript errors
3. Use `npm run test:watch` for test-driven development
4. Build with `npm run build` before production deployment

## Error Handling

Comprehensive error handling with:
- Structured error responses
- Context-aware suggestions
- Automatic recovery mechanisms
- Detailed logging for debugging

This TypeScript implementation provides enhanced type safety, better IDE support, and improved maintainability while maintaining full compatibility with the MCP protocol.