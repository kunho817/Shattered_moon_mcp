export interface MonitorParams {
    planId?: string;
    action: 'status' | 'optimize' | 'alerts' | 'metrics' | 'rebalance';
    filters?: {
        teams?: string[];
        taskStatus?: 'pending' | 'in_progress' | 'completed' | 'blocked';
        alertLevel?: 'info' | 'warning' | 'error';
    };
}
export interface MonitoringDashboard {
    overview: SystemOverview;
    activePlans: PlanSummary[];
    teamMetrics: TeamMetrics[];
    alerts: AlertSummary[];
    recommendations: string[];
    trends: TrendAnalysis;
}
export interface SystemOverview {
    totalActivePlans: number;
    totalActiveTasks: number;
    overallUtilization: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    averageTaskCompletion: number;
    parallelismEfficiency: number;
}
export interface PlanSummary {
    planId: string;
    description: string;
    progress: number;
    status: 'on_track' | 'delayed' | 'ahead' | 'blocked';
    estimatedCompletion: Date;
    riskLevel: 'low' | 'medium' | 'high';
    activeTeams: string[];
}
export interface TeamMetrics {
    team: string;
    currentLoad: number;
    efficiency: number;
    activeTasks: number;
    completionRate: number;
    averageTaskTime: number;
    bottlenecks: string[];
}
export interface AlertSummary {
    level: 'info' | 'warning' | 'error';
    count: number;
    recentAlerts: Array<{
        message: string;
        timestamp: Date;
        planId?: string;
        team?: string;
    }>;
}
export interface TrendAnalysis {
    performanceTrend: 'improving' | 'stable' | 'declining';
    utilizationTrend: 'increasing' | 'stable' | 'decreasing';
    qualityTrend: 'improving' | 'stable' | 'declining';
    predictedBottlenecks: string[];
    recommendedActions: string[];
}
export declare const realTimeTaskMonitor: (params: MonitorParams) => Promise<{
    content: {
        type: "text";
        text: string;
    }[];
} | {
    content: {
        type: "text";
        text: {
            content: Array<{
                type: "text";
                text: string;
            }>;
        };
    }[];
} | {
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=realTimeTaskMonitor.d.ts.map