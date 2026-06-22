"""
Agnes-Video-V2.0 视频批量生成脚本（精确对齐官方文档）
Base URL: https://apihub.agnes-ai.com/v1
模型: agnes-video-v2.0
工作流: POST /v1/videos 创建任务 → GET /agnesapi?video_id=xxx 轮询结果
"""

import os
import time
import json
import requests

# ============== 配置区 ==============

AGNES_API_KEY = "sk-WYyQlvJ8qAYxHVVgx2Zwn3DIWM0VVJAkCqQDPV9E7BfQyCzy"

BASE_URL = "https://apihub.agnes-ai.com/v1"
QUERY_URL = "https://apihub.agnes-ai.com/agnesapi"
MODEL_NAME = "agnes-video-v2.0"

# 视频参数（num_frames 必须是 8n+1，比如 121=8*15+1 约 5s，241=8*30+1 约 10s）
VIDEO_CONFIG = {
    "width": 1280,
    "height": 720,
    "num_frames": 121,
    "frame_rate": 24,
}

NEGATIVE_PROMPT = (
    "blurry, low resolution, watermark, text overlay, subtitles, logo, "
    "distorted face, asymmetric eyes, extra fingers, deformed hands, "
    "melting morphing geometry, oversaturated colors, plastic skin, "
    "glossy CG render, video-game look, 3D cartoon, anime shading, "
    "flat even studio lighting, perfectly clean flawless surfaces, "
    "frame flicker, ghosting, lifeless locked-off camera, "
    "weightless floaty motion, soft contact, slow-motion drift on every hit"
)

OUTPUT_DIR = "output"

# ============== 8 个分镜提示词 ==============

SCENES = [
    {
        "id": "scene_01_env",
        "prompt": (
            "Cinematic wide shot. An abandoned ancient Chinese temple courtyard in heavy rain. "
            "Cracked stone flagstone ground covered with puddles. Fine rain falls from the sky, "
            "rippling the water surface. A worn brass bell hangs under the eaves, swaying gently "
            "in the wind. The distant temple door stands half-open, candlelight inside flickering "
            "in the wind. No characters. Shot on Kodak 35mm film, desaturated cool cyan-grey "
            "palette with warm candlelight accents. Film grain texture. Handheld camera with "
            "extremely subtle breathing motion. Cinematic hard lighting."
        ),
    },
    {
        "id": "scene_02_faceoff",
        "prompt": (
            "Medium wide shot. A young swordsman and a black-cloaked assassin stand facing each "
            "other in an ancient temple courtyard, five paces apart. The swordsman is around 28-30 "
            "years old with sharp eyebrows and star-like eyes, his right hand resting on the "
            "sword hilt. His dark cyan robe is frayed at the edges. His copper-colored hand guard "
            "bears scratches and patina traces. The assassin wears a bamboo hat with torn black "
            "gauze hanging from the brim. Rain falls on both characters, sliding off their "
            "shoulders and the hat. Neither speaks. Eyes locked. Slow clockwise camera orbit "
            "keeping both in frame. Kodak 35mm film, cool cyan-grey tones with warm candlelight. "
            "Handheld breathing camera motion."
        ),
    },
    {
        "id": "scene_03_hilt",
        "prompt": (
            "Close-up macro shot of the sword hilt. The swordsman's right hand slowly tightens "
            "its grip on the hilt. The copper hand guard surface reflects candlelight, showing "
            "fine scratches. At the seam between the hilt and scabbard, a faint warm-white "
            "glimmer seeps out as if something long dormant is awakening. The swordsman's "
            "knuckles are white from the pressure, rainwater dripping down his fingers. "
            "Shallow depth of field, focus locked on the hilt. Slow push-in. Kodak 35mm film, "
            "cool cyan-grey with warm candlelight. Handheld breathing camera motion."
        ),
    },
    {
        "id": "scene_04_draw",
        "prompt": (
            "The swordsman's wrist tenses. The ancient sword slowly draws out of its scabbard "
            "with a long metallic ringing sound. As the blade fully leaves the scabbard, several "
            "thin dark-gold patterns emerge along the spine of the sword like bronze being "
            "re-polished. The blade vibrates faintly with a resonant hum, reflecting the candle "
            "flame and falling rain around it. The sword tip points downward, not raised. The "
            "swordsman's side profile is lit by the blade's faint glow, his eyes showing tired "
            "determination. Camera follows from medium shot to close-up, pushing slightly forward "
            "on the moment the blade clears the scabbard before settling. Kodak 35mm film, "
            "cool cyan-grey and warm candlelight palette. Handheld breathing camera motion."
        ),
    },
    {
        "id": "scene_05_first_clash",
        "prompt": (
            "The black-cloaked assassin strikes first. His left hand draws a short blade from "
            "behind his back and he steps forward with a horizontal slash. The swordsman's blade "
            "sinks downward then springs upward to meet it — steel meets steel with a sharp "
            "metallic crack. A tiny spray of sparks erupts at the point of impact. The swordsman's "
            "body recoils slightly from the counterforce, the hem of his wet robe swinging up "
            "from the motion. Their feet disturb the puddles on the stone ground, sending ripples "
            "outward. Over-the-shoulder shot from behind the swordsman's left shoulder, focus on "
            "the assassin. Camera follows the swordsman's step with a slight lateral pan. Kodak "
            "35mm film, cool cyan-grey tones with warm candlelight. Handheld breathing camera "
            "motion. Physics-based weight and impact."
        ),
    },
    {
        "id": "scene_06_feet",
        "prompt": (
            "Low-angle close-up on feet only. Rain-soaked stone flagstones of the temple "
            "courtyard. The swordsman's cloth boots step backward on the wet stone, the sole "
            "crushing a clear wave pattern into the puddle. The assassin's black leather boots "
            "press forward, squeezing water out from between the stone cracks. Above the frame "
            "line, the hem of robes and the tips of weapons are visible swinging, but never "
            "come into focus. Emphasis on physical weight, gravity, and the counterforce traces "
            "left on the ground. Locked-off shot with subtle breathing camera motion. Kodak "
            "35mm film, cool cyan-grey palette with warm candlelight accents."
        ),
    },
    {
        "id": "scene_07_over_shoulder",
        "prompt": (
            "Over-the-shoulder close-up. Foreground shows the back brim of the assassin's "
            "bamboo hat and its hanging cord. Background shows the swordsman's face and shoulder "
            "in sharp focus, shallow depth of field. Raindrops on the swordsman's forehead, a "
            "strand of hair stuck to his cheek. His eyebrows slightly furrowed, breathing "
            "slightly accelerated, gaze fixed forward on the assassin off-frame. The sword held "
            "horizontally in front of him, the dark-gold patterns on its spine still faintly "
            "visible through the rain. His lips pressed tight with effort. Locked shot with "
            "extremely subtle breathing camera motion. Kodak 35mm film, cool cyan-grey and warm "
            "candlelight palette."
        ),
    },
    {
        "id": "scene_08_ending",
        "prompt": (
            "Extreme wide shot. Rain continues to fall. The old brass bell under the temple "
            "eaves continues to sway gently. Candlelight inside the distant temple door continues "
            "to flicker. The two swordsmen stand three paces apart, their weapons crossed and "
            "locked — the swordsman's ancient sword angled upward against the assassin's short "
            "blade, both characters pressing their body weight into the lock. Neither wins. "
            "The frame holds. No explosion, no triumphant pose, no dramatic zoom-in. Just the "
            "rain, the pressure of two crossed weapons, and the silent temple courtyard. The "
            "frame holds for three beats. Hold. Locked-off wide shot. Kodak 35mm film, "
            "cool cyan-grey tones with warm candlelight."
        ),
    },
]

# ============== 核心逻辑 ==============

def build_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "Authorization": f"Bearer {AGNES_API_KEY}",
        "Content-Type": "application/json",
    })
    return s


def create_video_task(prompt: str, session: requests.Session) -> str:
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "height": VIDEO_CONFIG["height"],
        "width": VIDEO_CONFIG["width"],
        "num_frames": VIDEO_CONFIG["num_frames"],
        "frame_rate": VIDEO_CONFIG["frame_rate"],
        "negative_prompt": NEGATIVE_PROMPT,
    }
    url = BASE_URL + "/videos"
    resp = session.post(url, json=payload, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"创建任务失败 HTTP {resp.status_code}: {resp.text[:1000]}")
    data = resp.json()
    video_id = data.get("video_id")
    if not video_id:
        raise RuntimeError(f"返回中没有 video_id: {json.dumps(data, ensure_ascii=False)[:500]}")
    print(f"  → 任务已创建, video_id={video_id}, status={data.get('status')}, "
          f"预计时长 {data.get('seconds')}s, 分辨率 {data.get('size')}")
    return video_id


def poll_video_result(video_id: str, session: requests.Session,
                      poll_interval_sec: int = 5, max_wait_sec: int = 1800) -> str:
    print(f"  ↻ 开始轮询（每 {poll_interval_sec}s 查一次，最多等 {max_wait_sec}s）")
    start = time.time()
    while time.time() - start < max_wait_sec:
        try:
            resp = session.get(
                QUERY_URL,
                params={"video_id": video_id, "model_name": MODEL_NAME},
                timeout=60,
            )
            data = resp.json()
        except Exception as e:
            print(f"    · 轮询异常: {e}, 5s 后重试")
            time.sleep(5)
            continue

        status = data.get("status", "")
        progress = data.get("progress", 0)

        if status == "completed":
            video_url = data.get("remixed_from_video_id")
            if video_url:
                print(f"    ✓ 完成 (progress={progress}%)")
                return video_url
            raise RuntimeError(
                f"任务已完成但没找到视频 URL: {json.dumps(data, ensure_ascii=False)[:500]}"
            )

        if status in ("failed", "error", "rejected", "cancelled"):
            err = data.get("error")
            raise RuntimeError(
                f"任务失败 status={status}, error={err}, 完整响应: "
                f"{json.dumps(data, ensure_ascii=False)[:800]}"
            )

        print(f"    · status={status}, progress={progress}%, 等待 {poll_interval_sec}s...")
        time.sleep(poll_interval_sec)

    raise RuntimeError(f"轮询超时，任务 {video_id} 未在 {max_wait_sec}s 内完成")


def download_video(video_url: str, save_path: str, _session: requests.Session):
    # 注意：platform-outputs.agnes-ai.space 是公开存储服务器，带 Authorization 头会被 401 拒绝
    # 所以下载时必须用一个干净的、不带 API Key 头的 session
    print(f"  ↓ 下载视频: {os.path.basename(save_path)}")
    clean_session = requests.Session()  # 全新无认证头的 session
    resp = clean_session.get(video_url, timeout=600, stream=True)
    resp.raise_for_status()
    size = 0
    with open(save_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=1 << 20):
            if chunk:
                size += len(chunk)
                f.write(chunk)
    print(f"    ✓ 已保存 ({size / (1024*1024):.1f} MB)")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = build_session()

    print(f"模型: {MODEL_NAME}")
    print(f"分辨率: {VIDEO_CONFIG['width']}x{VIDEO_CONFIG['height']}")
    print(f"帧数: {VIDEO_CONFIG['num_frames']} 帧, FPS: {VIDEO_CONFIG['frame_rate']}")
    print(f"预计单镜时长: ~{VIDEO_CONFIG['num_frames'] / VIDEO_CONFIG['frame_rate']:.1f} 秒")
    print(f"共 {len(SCENES)} 个分镜，开始生成...\n")

    results = []
    for i, scene in enumerate(SCENES, 1):
        print(f"[{i}/{len(SCENES)}] {scene['id']}")
        print(f"  prompt 预览: {scene['prompt'][:90]}...")

        save_path = os.path.join(OUTPUT_DIR, f"{scene['id']}.mp4")
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            print(f"  ⊙ 已存在 {save_path}，跳过")
            results.append((scene["id"], save_path, "skipped"))
            continue

        try:
            video_id = create_video_task(scene["prompt"], session)
            video_url = poll_video_result(video_id, session)
            download_video(video_url, save_path, session)
            results.append((scene["id"], save_path, "ok"))
            print(f"  ✓ {scene['id']} 完成\n")
        except Exception as e:
            print(f"  ✗ {scene['id']} 失败: {e}\n")
            results.append((scene["id"], None, f"error: {e}"))

    print("\n" + "=" * 50)
    print("生成结果汇总：")
    ok_count = 0
    for name, path, status in results:
        mark = "✓" if status == "ok" else ("⊙" if status == "skipped" else "✗")
        print(f"  {mark} {name}: {path or status}")
        if status in ("ok", "skipped"):
            ok_count += 1
    print(f"\n成功 {ok_count}/{len(results)} 个分镜")
    print(f"视频文件目录: {os.path.abspath(OUTPUT_DIR)}/")


if __name__ == "__main__":
    main()
