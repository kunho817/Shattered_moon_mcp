import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor.js';
import * as fs from 'fs';
import * as path from 'path';

interface LearningFeedback {
  task_id: string;
  task: any;
  predictions: {
    success_probability: number;
    complexity: string;
    recommended_teams: string[];
  };
  actual_results?: {
    success: boolean;
    complexity: string;
    teams_used: string[];
    duration: number;
    performance_score: number;
  };
  timestamp: string;
}

interface LearningInsights {
  overall_performance: Record<string, any>;
  task_type_analysis: Record<string, any>;
  improvement_areas: string[];
  recommendations: string[];
}

export class LearningIntegration extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private taskTracking: Map<string, any> = new Map();
  private feedbackBuffer: LearningFeedback[] = [];
  private insights: LearningInsights | null = null;
  private performanceMonitor: PerformanceMonitor;
  private dataDir: string;

  constructor(performanceMonitor: PerformanceMonitor) {
    super();
    this.performanceMonitor = performanceMonitor;
    this.dataDir = path.join('/home/aizure0817/Game_Engine/mcp_learning_lab', 'data');
    this.ensureDataDirectories();
  }

  private ensureDataDirectories(): void {
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

  public connect(host: string = 'localhost', port: number = 8765): void {
    try {
      this.ws = new WebSocket(`ws://${host}:${port}`);

      this.ws.on('open', () => {
        logger.info('Connected to Learning Lab');
        this.emit('connected');
        
        // Register with learning system
        this.send({
          type: 'register',
          service: 'mcp_production',
          capabilities: ['task_tracking', 'feedback', 'insights']
        });
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleLearningMessage(message);
        } catch (error) {
          logger.error('Error parsing learning message:', error);
        }
      });

      this.ws.on('error', (error) => {
        logger.error('Learning WebSocket error:', error);
      });

      this.ws.on('close', () => {
        logger.warn('Learning connection closed');
        this.scheduleReconnect();
      });

    } catch (error) {
      logger.error('Failed to connect to Learning Lab:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      logger.info('Attempting to reconnect to Learning Lab...');
      this.connect();
    }, 5000);
  }

  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Buffer messages if not connected
      this.feedbackBuffer.push(data);
    }
  }

  private handleLearningMessage(message: any): void {
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
        logger.debug('Unknown learning message type:', message.type);
    }
  }

  private handlePredictionResponse(message: any): void {
    const { task_id, predictions } = message;
    if (task_id && this.taskTracking.has(task_id)) {
      const task = this.taskTracking.get(task_id);
      task.predictions = predictions;
      this.emit('prediction', { task_id, predictions });
    }
  }

  private handleLearningInsights(message: any): void {
    this.insights = message.insights;
    this.emit('insights', this.insights);
    
    // Save insights to file
    const insightsPath = path.join(this.dataDir, 'learning', 'latest_insights.json');
    fs.writeFileSync(insightsPath, JSON.stringify(this.insights, null, 2));
  }

  private handleModelUpdate(message: any): void {
    logger.info('Received model update notification');
    this.emit('model_updated', message);
  }

  public trackTaskStart(taskId: string, task: any, context: any = {}): void {
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

  public trackTaskComplete(
    taskId: string, 
    success: boolean, 
    actualComplexity?: string,
    teamsUsed?: string[]
  ): void {
    const task = this.taskTracking.get(taskId);
    if (!task) return;

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

    const resultPath = path.join(
      this.dataDir, 
      'results', 
      `result_${taskId}.json`
    );
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    // Clean up tracking
    this.taskTracking.delete(taskId);

    // Update performance metrics
    this.performanceMonitor.recordMetric('task_completed', 1);
    this.performanceMonitor.recordMetric('task_success_rate', success ? 1 : 0);
  }

  private calculatePerformanceScore(duration: number, success: boolean): number {
    // Simple performance calculation
    const baseScore = success ? 0.8 : 0.2;
    const speedBonus = Math.max(0, 0.2 - (duration / 300000)); // Bonus for < 5 min
    return Math.min(1.0, baseScore + speedBonus);
  }

  public async requestPrediction(task: any, context: any = {}): Promise<any> {
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

  public getInsights(): LearningInsights | null {
    return this.insights;
  }

  public getTaskPredictions(taskId: string): any {
    const task = this.taskTracking.get(taskId);
    return task?.predictions || null;
  }

  public async enhanceToolWithLearning(tool: Tool, args: any): Promise<any> {
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
    } catch (error) {
      logger.warn('Failed to get learning predictions:', error);
      return args;
    }
  }

  public recordToolResult(toolName: string, success: boolean, duration: number): void {
    const taskId = `tool_${toolName}_${Date.now()}`;
    
    this.trackTaskStart(taskId, {
      description: `Tool execution: ${toolName}`,
      type: 'tool_execution'
    });

    setTimeout(() => {
      this.trackTaskComplete(taskId, success);
    }, 100);
  }

  public getPerformanceReport(): any {
    const activeTaskCount = this.taskTracking.size;
    const feedbackPending = this.feedbackBuffer.length;
    
    return {
      status: this.ws?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
      active_tasks: activeTaskCount,
      feedback_pending: feedbackPending,
      latest_insights: this.insights ? {
        improvement_areas: this.insights.improvement_areas,
        recommendations: this.insights.recommendations
      } : null
    };
  }

  public disconnect(): void {
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

// Singleton instance
let learningIntegration: LearningIntegration | null = null;

export function initializeLearningIntegration(performanceMonitor: PerformanceMonitor): LearningIntegration {
  if (!learningIntegration) {
    learningIntegration = new LearningIntegration(performanceMonitor);
    learningIntegration.connect();
  }
  return learningIntegration;
}

export function getLearningIntegration(): LearningIntegration | null {
  return learningIntegration;
}