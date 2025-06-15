#!/bin/bash

# Fix sed damage from earlier commands
echo "Reverting sed changes that broke the code..."

# Fix the model type issues
find src -name "*.ts" -exec sed -i "s/model?: {taskId: 'opus-task', timestamp: new Date()} | 'sonnet';/model?: 'opus' | 'sonnet';/g" {} \;
find src -name "*.ts" -exec sed -i "s/modelUsed: {taskId: 'opus-task', timestamp: new Date()} | 'sonnet';/modelUsed: 'opus' | 'sonnet';/g" {} \;
find src -name "*.ts" -exec sed -i "s/model: {taskId: 'opus-task', timestamp: new Date()} | 'sonnet' = {taskId: 'opus-task', timestamp: new Date()}/model: 'opus' | 'sonnet' = 'opus'/g" {} \;
find src -name "*.ts" -exec sed -i "s/aiModel: {taskId: 'opus-task', timestamp: new Date()} | 'sonnet' | 'auto';/aiModel: 'opus' | 'sonnet' | 'auto';/g" {} \;

# Fix incorrect context usage
find src -name "*.ts" -exec sed -i "s/{taskId: 'opus-task', timestamp: new Date()}/{taskId: 'task', timestamp: new Date()}/g" {} \;

echo "Fixed TypeScript errors in enhanced utilities"