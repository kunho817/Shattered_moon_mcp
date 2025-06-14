"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningIntegration = void 0;
exports.initializeLearningIntegration = initializeLearningIntegration;
exports.getLearningIntegration = getLearningIntegration;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const logger_js_1 = require("../utils/logger.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class LearningIntegration extends events_1.EventEmitter {
    ws = null;
    reconnectTimer = null;
    taskTracking = new Map();
    feedbackBuffer = [];
    insights = null;
    performanceMonitor;
    dataDir;
    constructor(performanceMonitor) {
        super();
        this.performanceMonitor = performanceMonitor;
        this.dataDir = path.join('/home/aizure0817/Game_Engine/mcp_learning_lab', 'data');
        this.ensureDataDirectories();
    }
    ensureDataDirectories() {
        const dirs = [
            this.dataDir,
            path.join(this.dataDir, 'feedback'),
            path.join(this.dataDir, 'results'),
            path.join(this.dataDir, 'learning')
        ];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    connect(host = 'localhost', port = 8765) {
        try {
            this.ws = new ws_1.default(`ws://${host}:${port}`);
            this.ws.on('open', () => {
                logger_js_1.logger.info('Connected to Learning Lab');
                this.emit('connected');
                // Register with learning system
                this.send({
                    type: 'register',
                    service: 'mcp_production',
                    capabilities: ['task_tracking', 'feedback', 'insights']
                });
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleLearningMessage(message);
                }
                catch (error) {
                    logger_js_1.logger.error('Error parsing learning message:', error);
                }
            });
            this.ws.on('error', (error) => {
                logger_js_1.logger.error('Learning WebSocket error:', error);
            });
            this.ws.on('close', () => {
                logger_js_1.logger.warn('Learning connection closed');
                this.scheduleReconnect();
            });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to connect to Learning Lab:', error);
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            logger_js_1.logger.info('Attempting to reconnect to Learning Lab...');
            this.connect();
        }, 5000);
    }
    send(data) {
        if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
        else {
            // Buffer messages if not connected
            this.feedbackBuffer.push(data);
        }
    }
    handleLearningMessage(message) {
        switch (message.type) {
            case 'prediction_response':
                this.handlePredictionResponse(message);
                break;
            case 'learning_insights':
                this.handleLearningInsights(message);
                break;
            case 'model_update':
                this.handleModelUpdate(message);
                break;
            default:
                logger_js_1.logger.debug('Unknown learning message type:', message.type);
        }
    }
    handlePredictionResponse(message) {
        const { task_id, predictions } = message;
        if (task_id && this.taskTracking.has(task_id)) {
            const task = this.taskTracking.get(task_id);
            task.predictions = predictions;
            this.emit('prediction', { task_id, predictions });
        }
    }
    handleLearningInsights(message) {
        this.insights = message.insights;
        this.emit('insights', this.insights);
        // Save insights to file
        const insightsPath = path.join(this.dataDir, 'learning', 'latest_insights.json');
        fs.writeFileSync(insightsPath, JSON.stringify(this.insights, null, 2));
    }
    handleModelUpdate(message) {
        logger_js_1.logger.info('Received model update notification');
        this.emit('model_updated', message);
    }
    trackTaskStart(taskId, task, context = {}) {
        const trackingData = {
            task,
            context,
            startTime: Date.now(),
            status: 'in_progress'
        };
        this.taskTracking.set(taskId, trackingData);
        // Send to learning system
        this.send({
            type: 'task_started',
            task_id: taskId,
            task,
            context
        });
        // Log for performance monitoring
        this.performanceMonitor.recordMetric('task_started', 1);
    }
    trackTaskComplete(taskId, success, actualComplexity, teamsUsed) {
        const task = this.taskTracking.get(taskId);
        if (!task)
            return;
        const duration = Date.now() - task.startTime;
        const performanceScore = this.calculatePerformanceScore(duration, success);
        // Send completion data
        this.send({
            type: 'task_completed',
            task_id: taskId,
            success,
            actual_complexity: actualComplexity,
            teams_used: teamsUsed,
            duration,
            performance_score: performanceScore
        });
        // Save result for offline learning
        const result = {
            task_id: taskId,
            task: task.task,
            predictions: task.predictions,
            actual_results: {
                success,
                complexity: actualComplexity,
                teams_used: teamsUsed,
                duration,
                performance_score: performanceScore
            },
            timestamp: new Date().toISOString()
        };
        const resultPath = path.join(this.dataDir, 'results', `result_${taskId}.json`);
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
        // Clean up tracking
        this.taskTracking.delete(taskId);
        // Update performance metrics
        this.performanceMonitor.recordMetric('task_completed', 1);
        this.performanceMonitor.recordMetric('task_success_rate', success ? 1 : 0);
    }
    calculatePerformanceScore(duration, success) {
        // Simple performance calculation
        const baseScore = success ? 0.8 : 0.2;
        const speedBonus = Math.max(0, 0.2 - (duration / 300000)); // Bonus for < 5 min
        return Math.min(1.0, baseScore + speedBonus);
    }
    async requestPrediction(task, context = {}) {
        return new Promise((resolve, reject) => {
            const requestId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timeout = setTimeout(() => {
                this.removeAllListeners(`prediction_${requestId}`);
                reject(new Error('Prediction request timeout'));
            }, 5000);
            this.once(`prediction_${requestId}`, (predictions) => {
                clearTimeout(timeout);
                resolve(predictions);
            });
            this.send({
                type: 'prediction_request',
                request_id: requestId,
                task,
                context
            });
        });
    }
    getInsights() {
        return this.insights;
    }
    getTaskPredictions(taskId) {
        const task = this.taskTracking.get(taskId);
        return task?.predictions || null;
    }
    async enhanceToolWithLearning(tool, args) {
        // Request predictions for the tool execution
        try {
            const predictions = await this.requestPrediction({
                description: `Execute ${tool.name} with args`,
                tool_name: tool.name,
                args_summary: JSON.stringify(args).substring(0, 100)
            });
            return {
                ...args,
                _learning: {
                    success_probability: predictions.success_probability,
                    complexity: predictions.complexity,
                    recommendations: predictions.recommended_teams
                }
            };
        }
        catch (error) {
            logger_js_1.logger.warn('Failed to get learning predictions:', error);
            return args;
        }
    }
    recordToolResult(toolName, success, duration) {
        const taskId = `tool_${toolName}_${Date.now()}`;
        this.trackTaskStart(taskId, {
            description: `Tool execution: ${toolName}`,
            type: 'tool_execution'
        });
        setTimeout(() => {
            this.trackTaskComplete(taskId, success);
        }, 100);
    }
    getPerformanceReport() {
        const activeTaskCount = this.taskTracking.size;
        const feedbackPending = this.feedbackBuffer.length;
        return {
            status: this.ws?.readyState === ws_1.default.OPEN ? 'connected' : 'disconnected',
            active_tasks: activeTaskCount,
            feedback_pending: feedbackPending,
            latest_insights: this.insights ? {
                improvement_areas: this.insights.improvement_areas,
                recommendations: this.insights.recommendations
            } : null
        };
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
exports.LearningIntegration = LearningIntegration;
// Singleton instance
let learningIntegration = null;
function initializeLearningIntegration(performanceMonitor) {
    if (!learningIntegration) {
        learningIntegration = new LearningIntegration(performanceMonitor);
        learningIntegration.connect();
    }
    return learningIntegration;
}
function getLearningIntegration() {
    return learningIntegration;
}
//# sourceMappingURL=LearningIntegration.js.map