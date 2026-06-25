#!/bin/bash

cd "$(dirname "$0")"

echo "=========================================="
echo "   LibTV Studio - AI 视频创作工作台"
echo "=========================================="
echo ""

if [ ! -d "server/node_modules" ]; then
  echo "📦 正在安装后端依赖..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 正在安装前端依赖..."
  cd client && npm install && cd ..
fi

if [ ! -d "client/dist" ]; then
  echo "🔨 正在构建前端..."
  cd client && npm run build && cd ..
fi

echo ""
echo "🚀 启动服务中..."
echo "🌐 访问地址: http://localhost:3001"
echo "📹 视频存储: /workspace/uploads/videos/"
echo "🖼️  素材存储: /workspace/uploads/assets/"
echo ""
echo "按 Ctrl+C 停止服务"
echo "=========================================="
echo ""

cd server && node index.js
