#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agnes AI 图生视频工作流 (Image-to-Video Workflow)
基于 ai-shortfilm-prompts 的 5段式电影级提示词方法论

完整流程:
    1. 文生图 → 生成高质量参考图
    2. 图生视频 → 基于参考图生成动态视频

使用方法:
    # 一键完成：文生图 + 图生视频
    python image_to_video_workflow.py --style wuxia --prompt "你的角色描述" --seconds 5

    # 只用一张已有图片做图生视频
    python image_to_video_workflow.py --image-url "https://..." --motion "rain falling" --seconds 5

    # 列出所有风格预设
    python image_to_video_workflow.py --list
"""

import requests
import json
import time
import argparse
import sys
import os

BASE_URL = "https://apihub.agnes-ai.com/v1"

# 从环境变量读取 API Key（更安全）
API_KEY = os.environ.get("AGNES_API_KEY", "sk-kQmnO4IsMZ8c8dcBCQ5oJbElDYqy05rUPM9TUAp48QpRt3Bw")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


# ============================================================
#  风格预设：图片提示词 + 视频动态提示词
#  （基于 5段式结构提炼的图生视频专用版本）
# ============================================================

STYLES = {
    "wuxia": {
        "name": "武侠意境",
        "description": "古典武侠雨夜庭院，电影级光影",
        "image_prompt": """a lone martial artist in a flowing dark robe standing in a traditional Chinese temple courtyard at night, rain falling steadily, stone tiles glistening with water, red wooden pillars, large bronze incense burner with thin smoke, overhanging eaves dripping water, cinematic lighting, Kodak 35mm film look, moody atmosphere, photorealistic, 8k ultra detailed""",
        "video_prompt": """gentle rain falling, incense smoke curling upward, robe and hair swaying slightly in the breeze, water droplets dripping from eaves, subtle camera breathing float, cinematic mood, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "cyberpunk-mecha": {
        "name": "赛博机甲",
        "description": "赛博朋克女机甲战士，霓虹雨夜",
        "image_prompt": """female mech pilot in sleek advanced power armor, metallic gunmetal grey with glowing cyan blue accents, helmet with transparent visor and HUD display, standing in industrial port at night, heavy rain, wet concrete reflecting neon lights, shipping containers, cinematic cyberpunk aesthetic, Sony Venice camera look, hyperrealistic, 8k""",
        "video_prompt": """heavy rain falling, armor energy lines pulsing gently, steam rising from wet surfaces, neon reflections rippling in puddles, subtle camera breathing motion, cinematic atmosphere, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "scifi-transformation": {
        "name": "科幻变身",
        "description": "未来科技机甲觉醒，IMAX电影感",
        "image_prompt": """person in sleek dark tactical suit standing in futuristic laboratory, floor-to-ceiling windows showing city skyline, ambient blue lighting, holographic displays floating around, about to activate armor transformation, cinematic IMAX quality, Panavision lens look, photorealistic, 8k ultra detailed""",
        "video_prompt": """armor plates forming and extending across the body, energy lines tracing along seams, chest core module glowing brighter, holographic displays shifting, subtle camera push-in and breathing float, cinematic sci-fi, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "cozy-pet": {
        "name": "治愈萌宠",
        "description": "温暖治愈系人宠陪伴，阳光午后",
        "image_prompt": """young person sitting on sunlit wooden floor with a fluffy golden retriever dog, cozy home interior, big windows with golden afternoon light streaming in, warm comfortable atmosphere, soft shadows, ARRICAM Cooke S4 vintage lens look, warm film grade, photorealistic, 8k""",
        "video_prompt": """gentle sunlight shifting, dog tail wagging slowly, soft breeze moving curtains, warm dust motes floating in sunbeams, subtle camera breathing, cozy warm atmosphere, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "weapon-energy": {
        "name": "能量武器",
        "description": "科幻能量武器充能，赛博朋克工业风",
        "image_prompt": """armored figure holding an advanced energy blade weapon, dark tactical suit with amber accents, helmet with visor and HUD, industrial interior with dense atmospheric haze, dim amber warning lights, pipes and metal structures, cyberpunk aesthetic, cinematic close-up, Sony Venice look, hyperrealistic, 8k""",
        "video_prompt": """energy blade pulsing and glowing brighter, amber light shimmering along blade circuits, dust particles illuminated in the glow, mist swirling, subtle camera breathing and slow push-in, cinematic sci-fi, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "ocean-sunset": {
        "name": "海边日落",
        "description": "绝美海边日落，电影级氛围",
        "image_prompt": """lone figure standing on a cliff edge overlooking the ocean at golden hour sunset, wind blowing hair and clothing, dramatic clouds painted in orange and purple, waves crashing far below, cinematic wide shot, anamorphic lens flare, Panavision look, photorealistic, 8k ultra detailed""",
        "video_prompt": """waves rolling and crashing, hair and clothing blowing in the wind, clouds drifting slowly across the sky, sun gradually descending, subtle camera breathing and very slow push-in, epic cinematic atmosphere, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "fantasy-forest": {
        "name": "奇幻森林",
        "description": "魔法森林精灵，梦幻光影",
        "image_prompt": """mystical forest scene with glowing fireflies and magical particles, ancient trees with moss and vines, soft ethereal light filtering through canopy, a hooded figure in flowing cloak standing by a glowing crystal pool, dreamlike fantasy atmosphere, cinematic lighting, photorealistic, 8k""",
        "video_prompt": """fireflies floating gently, magical particles drifting in the air, light rays shifting through trees, water surface rippling softly, subtle camera breathing and slow lateral drift, dreamlike fantasy, photorealistic, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    },

    "anime-style": {
        "name": "动漫风格",
        "description": "日系动漫风格，精美画风",
        "image_prompt": """beautiful anime style illustration, young person with flowing hair standing on a school rooftop at sunset, dramatic sky with orange and pink clouds, wind blowing hair and uniform skirt, detailed artwork, Studio Ghibli inspired, vibrant colors, cinematic composition, high quality""",
        "video_prompt": """hair and clothing gently blowing in wind, clouds drifting across sunset sky, lens flare shifting subtly, cherry blossom petals floating by, slow subtle camera push-in, anime style, smooth animation, 24fps""",
        "image_size": "1024x576",
        "default_seconds": 5
    }
}


# ============================================================
#  核心函数：文生图 / 图生视频 / 状态查询
# ============================================================

def generate_image(prompt, size="1024x576", model="agnes-image-2.1-flash"):
    """文生图：生成参考图"""
    print(f"🖼️  正在生成参考图...")
    print(f"   模型: {model}")
    print(f"   尺寸: {size}")
    
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size
    }
    
    response = requests.post(
        f"{BASE_URL}/images/generations",
        headers=HEADERS,
        json=payload
    )
    result = response.json()
    
    if "data" in result and len(result["data"]) > 0:
        url = result["data"][0].get("url")
        print(f"✅ 图片生成成功!")
        print(f"   URL: {url}")
        return url
    else:
        print(f"❌ 图片生成失败: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return None


def image_to_video(image_url, motion_prompt, seconds=5, model="agnes-video-v2.0"):
    """图生视频：基于参考图生成动态视频"""
    print(f"\n🎬 正在提交图生视频任务...")
    print(f"   模型: {model}")
    print(f"   时长: {seconds}s")
    print(f"   参考图: {image_url[:60]}...")
    
    payload = {
        "model": model,
        "prompt": motion_prompt,
        "seconds": str(seconds),
        "input_image": image_url  # 图生视频关键字段
    }
    
    response = requests.post(
        f"{BASE_URL}/video/generations",
        headers=HEADERS,
        json=payload
    )
    result = response.json()
    
    if "id" in result:
        print(f"✅ 视频任务已提交!")
        print(f"   任务ID: {result['id']}")
        print(f"   尺寸: {result['size']}")
        return result["id"]
    else:
        print(f"❌ 提交失败: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return None


def check_video_status(task_id):
    """查询视频任务状态"""
    response = requests.get(
        f"{BASE_URL}/videos/{task_id}",
        headers=HEADERS
    )
    return response.json()


def get_video_url(status):
    """从结果中提取视频URL"""
    url = status.get("remixed_from_video_id") or status.get("video_url")
    if url and url.startswith("http"):
        return url
    return None


def wait_for_video(task_id, check_interval=15, timeout=1200, download=True, output_path=None):
    """等待视频生成完成，可选自动下载"""
    print(f"\n⏳ 等待视频生成中... (每 {check_interval}s 检查一次)")
    print(f"   任务ID: {task_id}")
    print("-" * 50)
    
    elapsed = 0
    while elapsed < timeout:
        status = check_video_status(task_id)
        current_status = status.get("status", "unknown")
        progress = status.get("progress", 0)
        
        if current_status == "completed":
            print(f"\n🎉 视频生成完成!")
            video_url = get_video_url(status)
            if video_url:
                print(f"🎬 视频URL: {video_url}")
                if download:
                    filename = output_path or f"{task_id}.mp4"
                    download_file(video_url, filename)
            return status
        elif current_status == "failed":
            print(f"\n❌ 生成失败")
            print(f"错误: {status.get('error', '未知错误')}")
            return status
        
        bar_length = 30
        filled = int(bar_length * progress / 100)
        bar = "█" * filled + "░" * (bar_length - filled)
        print(f"   [{bar}] {progress:3d}% | 状态: {current_status:10s} | 已等: {elapsed:4d}s", end="\r")
        
        time.sleep(check_interval)
        elapsed += check_interval
    
    print(f"\n⏰ 超时: {timeout}s 内未完成")
    return None


def download_file(url, output_path):
    """下载文件（带进度条）"""
    print(f"\n💾 正在下载到: {output_path}")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get("content-length", 0))
    
    with open(output_path, "wb") as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = int(downloaded / total_size * 100)
                print(f"   下载: {percent}% ({downloaded//1024}KB/{total_size//1024}KB)", end="\r")
    
    print(f"\n✅ 下载完成! 文件大小: {total_size//1024}KB")
    return output_path


def download_image(url, output_path=None):
    """下载图片"""
    if not output_path:
        filename = url.split("/")[-1]
        if not filename.endswith(".png") and not filename.endswith(".jpg"):
            filename = "reference_image.png"
        output_path = filename
    
    print(f"💾 下载参考图到: {output_path}")
    response = requests.get(url)
    with open(output_path, "wb") as f:
        f.write(response.content)
    print(f"✅ 参考图已保存")
    return output_path


# ============================================================
#  完整工作流
# ============================================================

def full_workflow(style_key, custom_prompt=None, seconds=None, download=True):
    """
    完整工作流：文生图 → 图生视频
    """
    if style_key not in STYLES:
        print(f"❌ 未知风格: {style_key}")
        print(f"可用风格: {', '.join(STYLES.keys())}")
        return None
    
    style = STYLES[style_key]
    video_seconds = seconds if seconds else style["default_seconds"]
    
    print("=" * 60)
    print(f"🎬 Agnes AI 图生视频完整工作流")
    print(f"   风格: {style['name']}")
    print(f"   视频时长: {video_seconds}s")
    print("=" * 60)
    
    # Step 1: 生成参考图
    image_prompt = custom_prompt if custom_prompt else style["image_prompt"]
    image_url = generate_image(
        image_prompt,
        size=style["image_size"]
    )
    
    if not image_url:
        return None
    
    # 下载参考图
    if download:
        download_image(image_url, f"ref_{style_key}.png")
    
    # Step 2: 图生视频
    motion_prompt = style["video_prompt"]
    if custom_prompt:
        motion_prompt = custom_prompt + ", " + motion_prompt
    
    task_id = image_to_video(
        image_url,
        motion_prompt,
        seconds=video_seconds
    )
    
    if not task_id:
        return None
    
    # Step 3: 等待完成
    result = wait_for_video(
        task_id,
        download=download,
        output_path=f"i2v_{style_key}.mp4"
    )
    
    print("\n" + "=" * 60)
    print("✅ 工作流完成!")
    print(f"   参考图: {image_url}")
    if result and get_video_url(result):
        print(f"   输出视频: {get_video_url(result)}")
    print("=" * 60)
    
    return result


def list_styles():
    """列出所有可用风格"""
    print("\n🎨 可用的图生视频风格:")
    print("-" * 60)
    for key, info in STYLES.items():
        print(f"  {key:25s} | {info['name']}")
        print(f"  {'':25s}   {info['description']}")
        print(f"  {'':25s}   默认时长: {info['default_seconds']}s")
        print()


# ============================================================
#  主函数
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Agnes AI 图生视频工作流 (Image-to-Video)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 列出所有风格
  python image_to_video_workflow.py --list

  # 使用预设风格一键生成（文生图+图生视频）
  python image_to_video_workflow.py --style wuxia --seconds 5

  # 使用预设风格 + 自定义描述
  python image_to_video_workflow.py --style cyberpunk-mecha --prompt "female samurai robot"

  # 只用已有图片做图生视频
  python image_to_video_workflow.py --image-url "https://..." --motion "rain falling" --seconds 5

  # 只生成参考图
  python image_to_video_workflow.py --style cozy-pet --image-only
        """
    )
    
    parser.add_argument("--list", action="store_true", 
                        help="列出所有可用风格")
    parser.add_argument("--style", type=str, default=None,
                        help="风格预设 (如: wuxia, cyberpunk-mecha, cozy-pet)")
    parser.add_argument("--prompt", type=str, default=None,
                        help="自定义图片提示词（覆盖预设）")
    parser.add_argument("--motion", type=str, default=None,
                        help="自定义视频动态描述")
    parser.add_argument("--seconds", type=int, default=None,
                        help="视频时长（秒）")
    parser.add_argument("--image-url", type=str, default=None,
                        help="已有图片URL（直接做图生视频，跳过文生图）")
    parser.add_argument("--image-only", action="store_true",
                        help="只生成参考图，不生成视频")
    parser.add_argument("--no-download", action="store_true",
                        help="不自动下载文件")
    parser.add_argument("--status", type=str, default=None,
                        help="查询指定任务ID的状态")
    
    args = parser.parse_args()
    
    # 列出风格
    if args.list:
        list_styles()
        return
    
    # 查询状态
    if args.status:
        status = check_video_status(args.status)
        print(json.dumps(status, indent=2, ensure_ascii=False))
        return
    
    # 模式1: 只用已有图片做图生视频
    if args.image_url:
        motion = args.motion or "subtle natural movement, cinematic, photorealistic, 24fps"
        seconds = args.seconds or 5
        
        print(f"\n🎬 图生视频模式")
        print(f"   参考图: {args.image_url[:60]}...")
        print(f"   时长: {seconds}s")
        
        task_id = image_to_video(args.image_url, motion, seconds=seconds)
        if task_id and not args.no_download:
            wait_for_video(task_id, download=True, output_path=f"i2v_custom.mp4")
        elif task_id:
            print(f"\n💡 任务已提交，ID: {task_id}")
            print(f"   查询进度: python {sys.argv[0]} --status {task_id}")
        return
    
    # 模式2: 使用预设风格
    if args.style:
        if args.style not in STYLES:
            print(f"❌ 未知风格: {args.style}")
            print(f"可用风格: {', '.join(STYLES.keys())}")
            sys.exit(1)
        
        if args.image_only:
            # 只生成参考图
            style = STYLES[args.style]
            prompt = args.prompt if args.prompt else style["image_prompt"]
            image_url = generate_image(prompt, size=style["image_size"])
            if image_url and not args.no_download:
                download_image(image_url, f"ref_{args.style}.png")
            return
        
        # 完整工作流
        full_workflow(
            args.style,
            custom_prompt=args.prompt,
            seconds=args.seconds,
            download=not args.no_download
        )
        return
    
    # 什么都没指定
    print("⚠️  请指定 --style 或 --image-url，或使用 --list 查看风格")
    parser.print_help()


if __name__ == "__main__":
    main()
