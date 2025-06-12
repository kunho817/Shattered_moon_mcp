import { EventEmitter } from 'events';
import logger from './logger.js';

export interface ProjectState {
  teams: Map<string, TeamState>;
  tasks: Map<string, TaskState>;
  specialists: Map<string, SpecialistState>;
  metadata: ProjectMetadata;
}

export interface TeamState {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'blocked';
  currentTasks: string[];
  completedTasks: number;
  members: string[];
}

export interface TaskState {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTeams: string[];
  priority: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  startTime?: Date;
  endTime?: Date;
  dependencies: string[];
  results?: any;
}

export interface SpecialistState {
  id: string;
  type: string;
  status: 'available' | 'busy' | 'offline';
  currentTask?: string;
  expertise: string;
  performance: number;
}

export interface ProjectMetadata {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
  teamUtilization: Map<string, number>;
  lastUpdated: Date;
}

export class ProjectStateManager extends EventEmitter {
  private state: ProjectState;
  private persistInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.state = {
      teams: new Map(),
      tasks: new Map(),
      specialists: new Map(),
      metadata: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageTaskTime: 0,
        teamUtilization: new Map(),
        lastUpdated: new Date()
      }
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing project state manager');
    
    // Initialize default teams
    const defaultTeams = [
      'planning', 'backend', 'frontend', 'testing', 
      'documentation', 'performance', 'devops'
    ];
    
    defaultTeams.forEach(teamName => {
      this.state.teams.set(teamName, {
        id: teamName,
        name: `${teamName.charAt(0).toUpperCase() + teamName.slice(1)} Team`,
        status: 'idle',
        currentTasks: [],
        completedTasks: 0,
        members: []
      });
    });

    // Start persistence
    this.persistInterval = setInterval(() => {
      this.persist();
    }, 30000); // Every 30 seconds
  }

  createTask(task: Omit<TaskState, 'id'>): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: TaskState = {
      ...task,
      id,
      status: task.status || 'pending',
      dependencies: task.dependencies || []
    };

    this.state.tasks.set(id, newTask);
    this.state.metadata.totalTasks++;
    this.updateMetadata();
    this.emit('taskCreated', newTask);
    
    return id;
  }

  updateTask(taskId: string, updates: Partial<TaskState>): void {
    const task = this.state.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updatedTask = { ...task, ...updates };
    this.state.tasks.set(taskId, updatedTask);

    // Update metadata
    if (updates.status === 'completed' && task.status !== 'completed') {
      this.state.metadata.completedTasks++;
      if (task.startTime) {
        const duration = Date.now() - task.startTime.getTime();
        this.updateAverageTaskTime(duration);
      }
    } else if (updates.status === 'failed' && task.status !== 'failed') {
      this.state.metadata.failedTasks++;
    }

    this.updateMetadata();
    this.emit('taskUpdated', updatedTask);
  }

  assignTaskToTeam(taskId: string, teamId: string): void {
    const task = this.state.tasks.get(taskId);
    const team = this.state.teams.get(teamId);

    if (!task || !team) {
      throw new Error('Task or team not found');
    }

    // Update task
    if (!task.assignedTeams.includes(teamId)) {
      task.assignedTeams.push(teamId);
    }

    // Update team
    if (!team.currentTasks.includes(taskId)) {
      team.currentTasks.push(taskId);
      team.status = 'busy';
    }

    this.updateTeamUtilization();
    this.emit('taskAssigned', { taskId, teamId });
  }

  completeTask(taskId: string): void {
    const task = this.state.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Remove from assigned teams
    task.assignedTeams.forEach(teamId => {
      const team = this.state.teams.get(teamId);
      if (team) {
        team.currentTasks = team.currentTasks.filter(id => id !== taskId);
        team.completedTasks++;
        if (team.currentTasks.length === 0) {
          team.status = 'idle';
        }
      }
    });

    // Update task
    this.updateTask(taskId, {
      status: 'completed',
      endTime: new Date()
    });
  }

  addSpecialist(specialist: Omit<SpecialistState, 'id'>): string {
    const id = `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSpecialist: SpecialistState = {
      ...specialist,
      id,
      status: specialist.status || 'available',
      performance: specialist.performance || 1.0
    };

    this.state.specialists.set(id, newSpecialist);
    this.emit('specialistAdded', newSpecialist);
    
    return id;
  }

  updateSpecialist(specialistId: string, updates: Partial<SpecialistState>): void {
    const specialist = this.state.specialists.get(specialistId);
    if (!specialist) {
      throw new Error(`Specialist not found: ${specialistId}`);
    }

    const updatedSpecialist = { ...specialist, ...updates };
    this.state.specialists.set(specialistId, updatedSpecialist);
    this.emit('specialistUpdated', updatedSpecialist);
  }

  getState(): ProjectState {
    return this.state;
  }

  getTeamStatus(teamId: string): TeamState | undefined {
    return this.state.teams.get(teamId);
  }

  getTaskStatus(taskId: string): TaskState | undefined {
    return this.state.tasks.get(taskId);
  }

  getAvailableSpecialists(type?: string): SpecialistState[] {
    const specialists = Array.from(this.state.specialists.values());
    const available = specialists.filter(s => s.status === 'available');
    
    if (type) {
      return available.filter(s => s.type === type);
    }
    
    return available;
  }

  private updateAverageTaskTime(duration: number): void {
    const completed = this.state.metadata.completedTasks;
    const currentAvg = this.state.metadata.averageTaskTime;
    
    this.state.metadata.averageTaskTime = 
      (currentAvg * (completed - 1) + duration) / completed;
  }

  private updateTeamUtilization(): void {
    this.state.teams.forEach((team, teamId) => {
      const utilization = team.currentTasks.length / 5; // Assume max 5 tasks per team
      this.state.metadata.teamUtilization.set(teamId, Math.min(utilization, 1));
    });
  }

  private updateMetadata(): void {
    this.state.metadata.lastUpdated = new Date();
  }

  private async persist(): Promise<void> {
    // In production, this would save to a database
    logger.debug('Persisting project state');
  }

  async shutdown(): Promise<void> {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    await this.persist();
  }
}