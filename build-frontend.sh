#!/bin/bash

cd "$(dirname "$0")"

echo "🔨 构建前端生产版本..."
cd client && npm run build && cd ..

echo ""
echo "✅ 构建完成！前端文件已输出到 client/dist/"
echo "   启动服务: ./start.sh"
