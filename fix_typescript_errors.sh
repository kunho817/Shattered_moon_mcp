#!/bin/bash

echo "🔧 Fixing TypeScript compilation errors..."

# Fix undefined response errors in enhanced utilities
echo "Fixing undefined response access..."
find src/utils -name "*.ts" -exec sed -i "s/JSON\.parse(result\.response)/JSON.parse(result.response || '[]')/g" {} \;
find src/utils -name "*.ts" -exec sed -i "s/result\.response)/result.response || '{}'))/g" {} \;

# Fix context parameter errors - use proper context objects
echo "Fixing context parameter errors..."
find src/utils -name "*.ts" -exec sed -i "s/'sonnet'/{taskId: 'sonnet-task', timestamp: new Date()}/g" {} \;
find src/utils -name "*.ts" -exec sed -i "s/'opus'/{taskId: 'opus-task', timestamp: new Date()}/g" {} \;

# Fix null/undefined object access
echo "Fixing null safety issues..."
find src -name "*.ts" -exec sed -i "s/\\.specialists\\.get(type)/?.specialists?.get(type)/g" {} \;

# Fix return type issues
echo "Fixing async return types..."
find src/utils -name "*.ts" -exec sed -i "s/): Promise<void | any>/): Promise<void>/g" {} \;

# Fix index signature issues
echo "Fixing index signature issues..."
find src/utils -name "*.ts" -exec sed -i "s/SPECIALISTS\[type\]/SPECIALISTS\[type as keyof typeof SPECIALISTS\]/g" {} \;

echo "✅ TypeScript error fixes applied"