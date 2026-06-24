#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agnes AI × ai-shortfilm-prompts 视频生成脚本
基于 Mx-Shell 5段式结构的电影级提示词生成器

使用方法:
    python agnes_shortfilm_generator.py --type transformation --seconds 10
    python agnes_shortfilm_generator.py --type atmospheric --seconds 5
    python agnes_shortfilm_generator.py --list
"""

import requests
import json
import time
import argparse
import sys

BASE_URL = "https://apihub.agnes-ai.com/v1"
API_KEY = "sk-kQmnO4IsMZ8c8dcBCQ5oJbElDYqy05rUPM9TUAp48QpRt3Bw"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


# ============================================================
#  5段式提示词库（Mx-Shell 方法论）
# ============================================================

PROMPTS = {
    "transformation": {
        "name": "科幻变身·机甲觉醒",
        "description": "未来科技机甲变身，IMAX电影感",
        "default_seconds": 10,
        "prompt": """Core theme: futuristic mecha awakening | sci-fi transformation | cinematic IMAX quality | advanced tech armor | atmospheric sci-fi

[Character & scene setup]
Pilot: A determined person in a sleek dark tactical suit. Focused expression, steady gaze. Hair pulled back neatly. Subtle tech details on the suit.
Armor system: Advanced exoskeleton armor with metallic silver and deep cobalt blue accents. Glowing energy lines trace along the armor plates. Central core module on the chest.
Scene: Futuristic laboratory interior at night. Floor-to-ceiling windows showing a city skyline. Ambient blue lighting. Holographic displays floating around. Soft ambient particles in the air.

[Atmosphere & quality]
Visual base: Anamorphic widescreen cinematic. Simulated IMAX film camera, paired with Panavision C-series lens (35mm focal, f/4 aperture).
Color & tone: Deep blue and silver dominant. Cool cyan ambient light with warm white highlights from energy systems. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Style core: Photorealistic sci-fi cinematic feel. Emphasize the fusion of human and advanced technology. Build a sense of awe and technological wonder.

[Camera rules]
Single-shot: One continuous take, no editing.
Angle: Open with low-angle shot, character framed at 30 degrees from the left, waist-up. As transformation begins, camera orbits very slowly to a level head-on at upper body.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard]
0-3s: Subject stands with calm, focused posture. Head slightly bowed, gaze fixed on the chest module. Steady breathing. Right hand slowly rises, palm hovering over the core. Both eyes reflect the ambient blue light with quiet determination.
3-6s: Palm makes contact with the chest module. The core lights up with bright cobalt blue glow, energy rippling outward in concentric circles. Mechanisms click and engage with precise, clean movements. Air shimmers slightly around the subject as the system activates.
6-9s: Armor plating extends from the core module across the torso, forming smoothly with geometric precision. White energy lines trace along the seams, illuminating path of the forming armor. Shoulder pauldrons lock into place with satisfying clicks, blue light pulsing in rhythm with activation.
9-12s: Full exoskeleton forms around the body, surface gleaming with metallic finish. The helmet assembly descends from above, visor activating with a cool blue glow. Energy lines stabilize and settle into a steady pulse pattern. Final plates click into alignment as the transformation completes.

Closing: No dialogue. No explosion. Just the fully armored figure standing calmly in the lab, energy core glowing steadily. City lights twinkle through the windows behind.
Sound: No score. Production audio only. Precise mechanical clicks, soft energy hum, ambient lab sounds, distant city ambiance."""
    },

    "atmospheric": {
        "name": "雨夜武侠·庭院意境",
        "description": "古典武侠雨夜庭院，电影级光影",
        "default_seconds": 5,
        "prompt": """Core theme: classical wuxia atmosphere | rain-slicked temple courtyard | cinematic lighting | martial arts aesthetic | tranquil yet tense

[Character & scene setup]
Wanderer: A lone martial artist in a flowing dark grey robe, finely woven texture. Long black hair tied back neatly, a few strands framing the face. Calm composed expression, eyes clear and focused. Straight sword in a dark wooden scabbard across the back, simple elegant fittings.
Scene: A traditional Chinese temple courtyard at night, gentle rain falling. Smooth stone tiles glistening with water. Red wooden pillars with subtle weathering. Large bronze incense burner in the center, thin wispy smoke curling upward. Overhanging eaves with dripping water. Distant garden barely visible through mist.

[Atmosphere & quality]
Classical martial arts cinema style. Traditional Chinese aesthetic meets cinematic craftsmanship. Kodak 35mm vintage film look. Soft glow on highlights. Rich texture. Live-action feel, photorealistic.
Color & light: Dramatic mood lighting. Cool slate-grey and deep blue ambient tones. Warm golden glow from lanterns reflecting on wet surfaces. Hard cinematic light, clear depth and dimension.

[Camera rules]
Single continuous shot. Slow graceful lateral drift across the courtyard.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard]
The wanderer steps into the courtyard from the left, steps making soft splashes in the puddles. Pauses at the entrance, gazes toward the temple hall. Rain droplets catch the light on the robe. A hand rests gently on the sword hilt. Then stands motionless in the courtyard center, facing the temple. Rain falls steadily. Perfect stillness - only the robe and hair move slightly in the breeze. Eyes close briefly in meditation, then open with quiet resolve. The hand slowly and deliberately wraps around the sword hilt. Fingers settle. Head tilts slightly - sensing the surroundings.

Closing: No dialogue. No combat. Just the gentle sound of rain, and the figure standing in the courtyard, hand on sword, at peace yet ready. A distant bell tolls softly.
Sound: No score. Production audio only. Rain on stone, rain on wood, water dripping, distant bell, soft rustle of fabric."""
    },

    "emotional-pet": {
        "name": "温暖陪伴·萌宠时光",
        "description": "治愈系人宠陪伴，温暖怀旧",
        "default_seconds": 8,
        "prompt": """Core theme: warm companionship | pet and owner | cozy everyday moments | gentle nostalgic feel | heartfelt and sincere

[Character & scene setup]
Person: A kind-faced young adult with a warm smile and bright eyes. Wearing comfortable home clothes - soft sweater and jeans. Relaxed posture.
Dog: A medium-sized fluffy golden retriever mix with floppy ears and a happy wagging tail. Soft well-cared-for fur. Wearing a simple blue collar with a small tag.
Scene: A cozy sunlit home and small garden. Warm wooden floors, a comfortable couch. Big windows letting in golden afternoon light. Small garden with green grass and a few flowers.

[Atmosphere & quality]
Shot on ARRICAM with Cooke S4 vintage primes, Kodak Vision3 250D 35mm film stock. Warm golden natural light, soft shadows, gentle film grain. Cozy warm filmic grade throughout - inviting and comfortable.

[Camera rules]
Edited across shots. Mostly gentle static or slow-moving shots, at eye level with both person and dog.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard]
Low eye-level wide shot. A cardboard box by the front door on a sunny morning. A fluffy golden puppy with floppy ears carefully climbs out of the box and trots over to lick the persons outstretched hand. Both full of gentle curiosity.
Then mid-wide shot in the garden, bright afternoon sun dappling through leaves. The young dog bounds happily alongside the person, tail wagging, ears flopping. They sit together in the grass, the dog leaning against their leg.
Then wide shot through the kitchen window, golden late afternoon light. The adult dog lies by the door, head on paws, looking out. The person comes home, opens the door - the dogs tail thumps happily on the floor, then stands up to greet them.
Closing shot: Eye-level wide in the garden, golden hour light. No dialogue. No dramatic music. Just the person and the dog walking slowly together along the garden path, side by side, as the sun sets gently. A single leaf floats down.

Sound: No score. Production audio only. Happy dog panting, birds chirping, soft breeze, gentle footsteps, contented sigh."""
    },

    "mecha-shield": {
        "name": "机甲护盾·雨夜觉醒",
        "description": "科幻女机甲能量护盾，暴雨夜对峙",
        "default_seconds": 8,
        "prompt": """Core theme: sci-fi mech shield | rainy night scene | futuristic power armor | cinematic cyberpunk | energy field effect

[Character & scene setup]
Pilot: Female pilot in sleek advanced power armor suit. Metallic gunmetal grey with glowing cyan blue accents. Smooth helmet with transparent visor, heads-up display visible inside. Athletic streamlined design. Left forearm features a large circular shield emitter array.
Scene: Industrial port facility at night in heavy rain. Wet concrete and metal surfaces reflecting neon lights. Shipping containers and industrial structures in the background. Periodic lightning flashes in the distance.

[Atmosphere & quality]
Visual base: Anamorphic widescreen cinematic. Simulated Sony Venice cinema camera with Canon K-35 series lenses.
Color & tone: Hollywood teal-and-orange color grade. Cool cyan-grey ambient with warm orange highlights from neon and systems. Dark moody lighting, high contrast. Shadow detail preserved. Subtle edge bloom, fine film grain. Volumetric rain and mist effects.
Style core: Gritty realistic sci-fi. Photorealistic, live-action cinematic quality.

[Camera rules]
Single-shot, medium to close-up framing.
Angle: Slightly low angle, subject framed slightly off-center for dynamic composition. Slow deliberate push-in.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard]
Medium shot: The mech pilot stands steady in the heavy rain, posture calm and ready. Breathing is even and controlled. Left arm rests at the side, shield emitter dark and inactive. Rain runs smoothly off the armor surface.
Then she raises her left arm, forearm extended forward. Fingers curl with deliberate precision. Circular energy cells on the forearm emitter illuminate sequentially in bright cyan blue, traveling outward from the center.
Then a crackling energy field expands from the emitter, forming a wide transparent dome shield in front of her. Raindrops hit the shield surface and vaporize instantly, creating a shimmering mist halo effect. A flash of distant lightning backlights the scene, outlining her silhouette against the storm.

Closing: No dialogue. Just the energy shield glowing steadily in the rain. Mist swirling around its edge. The quiet hum of power.
Sound: No score. Production audio only. Steady rain, electrical hum, distant thunder, subtle servo movement."""
    },

    "weapon-charge": {
        "name": "能量武器·光刃充能",
        "description": "科幻能量武器充能，赛博朋克美学",
        "default_seconds": 8,
        "prompt": """Core theme: sci-fi energy weapon charging | plasma blade | futuristic tech | cyberpunk industrial | cinematic close-up

[Character & scene setup]
Operator: Armored figure in advanced tactical suit. Dark grey plating with glowing amber accents. Sleek helmet with transparent visor, amber HUD indicators visible inside. Focused stance.
Weapon: Advanced energy blade weapon. Dark composite hilt with textured grip. Metallic blade shaft with intricate circuit patterns along its length. A central energy channel running the full length of the blade.
Scene: Industrial interior facility with dense atmospheric haze. Dim amber warning lights on walls. Exposed pipes and metal walkways. Low visibility due to mist particles.

[Atmosphere & quality]
Visual style: Cyberpunk sci-fi, cinematic quality, hyperreal, photorealistic live-action.
Color & tone: Classic teal-and-amber palette. Cool ambient cyan-grey environment contrasting with warm amber weapon glow. High intensity energy effects. Strong warm-cool contrast as the visual signature.
Lighting: Dark and atmospheric, high contrast. Deep shadows with preserved detail. Subtle bloom on light sources, fine film grain throughout.
Camera: Sony Venice cinema camera with Canon K-35 series lenses. Tight close-ups with shallow depth of field.

[Camera rules]
Close-up focused sequence with smooth camera movements. Rhythmic cuts synchronized to the charging action.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard]
Extreme close-up side profile: Helmet visor detail. The operators eyes visible behind the glass - focused and steady. Amber HUD readouts reflect and dance on the visor surface and in the eyes.
Then back-of-hand close-up. A gloved mechanical hand opens and closes with smooth precision. The weapon appears in the hand - first as faint geometric light patterns, then materializing into solid form with clean technological precision.
Then the blade charges: Amber energy pulses rhythmically from the hilt up along the blade circuits to the tip. The central energy channel ignites with a bright concentrated amber glow, casting warm dramatic light across the surroundings. Suspended dust and mist particles catch the light, creating visible light beams.

Closing: No dialogue. Just the energy blade fully charged and humming with power, held steady in the mist. The glow pulsing gently in a steady rhythm.
Sound: No score. Production audio only. Low energy hum, subtle mechanical clicks, ambient industrial drone, soft electrical fizz."""
    }
}


# ============================================================
#  API 调用函数
# ============================================================

def submit_video_task(prompt, seconds=5, model="agnes-video-v2.0"):
    """提交视频生成任务"""
    payload = {
        "model": model,
        "prompt": prompt,
        "seconds": str(seconds)
    }
    response = requests.post(
        f"{BASE_URL}/video/generations",
        headers=HEADERS,
        json=payload
    )
    result = response.json()
    if "id" in result:
        print(f"✅ 任务已提交")
        print(f"   任务ID: {result['id']}")
        print(f"   模型: {result['model']}")
        print(f"   时长: {result['seconds']}s")
        print(f"   尺寸: {result['size']}")
        print(f"   状态: {result['status']}")
        return result["id"]
    else:
        print(f"❌ 提交失败: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return None


def check_video_status(task_id):
    """查询任务状态"""
    response = requests.get(
        f"{BASE_URL}/videos/{task_id}",
        headers=HEADERS
    )
    return response.json()


def get_video_url(status):
    """从返回结果中提取视频URL"""
    url = status.get("remixed_from_video_id") or status.get("video_url") or status.get("url")
    if url and url.startswith("http"):
        return url
    video_id = status.get("video_id", "")
    if video_id.startswith("http"):
        return video_id
    return None


def download_video(url, output_path=None):
    """下载视频文件"""
    if not output_path:
        filename = url.split("/")[-1]
        output_path = filename
    
    print(f"💾 正在下载视频到: {output_path}")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get("content-length", 0))
    
    with open(output_path, "wb") as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = int(downloaded / total_size * 100)
                print(f"   下载进度: {percent}% ({downloaded//1024}KB/{total_size//1024}KB)", end="\r")
    
    print(f"\n✅ 下载完成: {output_path}")
    return output_path


def wait_for_video(task_id, check_interval=15, timeout=1200, download=True):
    """等待视频生成完成"""
    print(f"\n⏳ 等待视频生成中... (每 {check_interval}s 检查一次)")
    print(f"   任务ID: {task_id}")
    print("-" * 50)
    
    elapsed = 0
    while elapsed < timeout:
        status = check_video_status(task_id)
        current_status = status.get("status", "unknown")
        progress = status.get("progress", 0)
        
        if current_status == "completed":
            print(f"\n🎉 生成完成!")
            video_url = get_video_url(status)
            if video_url:
                print(f"🎬 视频URL: {video_url}")
                if download:
                    filename = f"{task_id}.mp4"
                    download_video(video_url, filename)
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


def list_prompts():
    """列出所有可用提示词类型"""
    print("\n📋 可用的视频类型:")
    print("-" * 60)
    for key, info in PROMPTS.items():
        print(f"  {key:20s} | {info['name']}")
        print(f"  {'':20s}   {info['description']}")
        print(f"  {'':20s}   默认时长: {info['default_seconds']}s")
        print()


def generate_image(prompt, size="1024x1024", model="agnes-image-2.1-flash"):
    """生成图片（用于参考图）"""
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
        print(f"🖼️  图片生成成功: {url}")
        return url
    else:
        print(f"❌ 图片生成失败: {result}")
        return None


# ============================================================
#  主函数
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Agnes AI × ai-shortfilm-prompts 视频生成器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python agnes_shortfilm_generator.py --list
  python agnes_shortfilm_generator.py --type atmospheric
  python agnes_shortfilm_generator.py --type transformation --seconds 10
  python agnes_shortfilm_generator.py --type mecha-shield --seconds 8 --wait
        """
    )
    
    parser.add_argument("--list", action="store_true", 
                        help="列出所有可用的视频类型")
    parser.add_argument("--type", type=str, default=None,
                        help="视频类型 (如: transformation, atmospheric, mecha-shield)")
    parser.add_argument("--seconds", type=int, default=None,
                        help="视频时长（秒）")
    parser.add_argument("--wait", action="store_true",
                        help="提交后等待生成完成")
    parser.add_argument("--image", action="store_true",
                        help="生成图片而不是视频（用 --type 指定提示词）")
    parser.add_argument("--custom", type=str, default=None,
                        help="使用自定义提示词")
    
    args = parser.parse_args()
    
    # 列出所有类型
    if args.list:
        list_prompts()
        return
    
    # 确定提示词
    if args.custom:
        prompt = args.custom
        prompt_name = "自定义提示词"
        default_seconds = 5
    elif args.type:
        if args.type not in PROMPTS:
            print(f"❌ 未知类型: {args.type}")
            print(f"可用类型: {', '.join(PROMPTS.keys())}")
            sys.exit(1)
        info = PROMPTS[args.type]
        prompt = info["prompt"]
        prompt_name = info["name"]
        default_seconds = info["default_seconds"]
    else:
        print("⚠️  请指定 --type 或 --custom，或使用 --list 查看可用类型")
        parser.print_help()
        sys.exit(1)
    
    seconds = args.seconds if args.seconds else default_seconds
    
    print(f"\n🎬 正在生成: {prompt_name}")
    print(f"   时长: {seconds}s")
    print(f"   模型: agnes-video-v2.0")
    print("-" * 50)
    
    # 生成图片还是视频
    if args.image:
        # 提取前几句作为图片提示词
        image_prompt = prompt.split("[Storyboard]")[0][:500]
        print(f"🖼️  生成参考图...")
        url = generate_image(image_prompt)
        return
    
    # 提交视频任务
    task_id = submit_video_task(prompt, seconds=seconds)
    
    if not task_id:
        sys.exit(1)
    
    # 是否等待
    if args.wait:
        result = wait_for_video(task_id)
        return
    
    print(f"\n💡 提示: 使用以下命令查看进度:")
    print(f"   python {sys.argv[0]} --status {task_id}")
    print(f"\n   或直接查询 API:")
    print(f"   curl -H \"Authorization: Bearer {API_KEY[:10]}...\" {BASE_URL}/videos/{task_id}")


if __name__ == "__main__":
    main()
