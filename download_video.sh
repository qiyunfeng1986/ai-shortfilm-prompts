#!/bin/bash
echo "视频文件位置: /workspace/output/wuxia_fight_full.mp4"
echo "大小: $(ls -lh /workspace/output/wuxia_fight_full.mp4 | awk '{print $5}')"
echo "---"
echo "请在终端中执行以下命令下载："
echo "cp /workspace/output/wuxia_fight_full.mp4 ~/Desktop/"
echo "或者直接打开文件管理器导航到 /workspace/output/"
