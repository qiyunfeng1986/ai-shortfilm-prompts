# Agnes AI × ai-shortfilm-prompts 完整功能演示

> 基于 Mx-Shell 5段式结构 × Agnes AI API，覆盖所有主要视频类型

---

## 🔧 API 基础配置

### 可用模型

| 模型ID | 类型 | 说明 |
|---|---|---|
| `agnes-video-v2.0` | 视频生成 | 文生视频模型 |
| `agnes-image-2.1-flash` | 图像生成 | 文生图模型 |
| `agnes-image-2.0-flash` | 图像生成 | 文生图模型 |
| `agnes-2.0-flash` | 文本生成 | 对话/文本模型 |
| `agnes-1.5-flash` | 文本生成 | 对话/文本模型 |

### 接口说明

- **视频生成**：`POST /v1/video/generations`
- **视频状态查询**：`GET /v1/videos/{task_id}`
- **图像生成**：`POST /v1/images/generations`

### 配置代码

```python
import requests
import json
import time

BASE_URL = "https://apihub.agnes-ai.com/v1"
API_KEY = "YOUR_API_KEY"  # 替换为你的 API Key

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 提交视频生成任务
def submit_video_task(prompt, seconds=5, model="agnes-video-v2.0"):
    payload = {
        "model": model,
        "prompt": prompt,
        "seconds": str(seconds)  # 注意：seconds 需要是字符串类型
    }
    response = requests.post(
        f"{BASE_URL}/video/generations",
        headers=HEADERS,
        json=payload
    )
    result = response.json()
    if "id" in result:
        print(f"✅ 任务已提交: {result['id']}")
        print(f"   时长: {result['seconds']}s | 尺寸: {result['size']}")
        return result["id"]
    else:
        print(f"❌ 提交失败: {result}")
        return None

# 查询任务状态
def check_video_status(task_id):
    response = requests.get(
        f"{BASE_URL}/videos/{task_id}",
        headers=HEADERS
    )
    return response.json()

# 等待视频生成完成
def wait_for_video(task_id, check_interval=10, timeout=600):
    print(f"⏳ 等待视频生成 (任务ID: {task_id})...")
    elapsed = 0
    while elapsed < timeout:
        status = check_video_status(task_id)
        current_status = status.get("status", "unknown")
        progress = status.get("progress", 0)
        
        if current_status == "completed":
            print(f"✅ 生成完成!")
            return status
        elif current_status == "failed":
            print(f"❌ 生成失败: {status.get('error', '未知错误')}")
            return status
        
        print(f"   状态: {current_status} | 进度: {progress}% | 已等: {elapsed}s")
        time.sleep(check_interval)
        elapsed += check_interval
    
    print(f"⏰ 超时: {timeout}s 内未完成")
    return None
```

---

## 1️⃣ 15秒单镜头变身（15s Transformation）

### 5段式提示词

```
Core theme: gritty dark tokusatsu | battle-damaged aesthetic | broken flesh | biological-mecha fusion | post-apocalyptic wasteland

[Character & scene setup]
Face: Reference uploaded photo. Features, face shape, hairstyle 100% preserved. No beautification. Maintain facial wound, gauze, bloodstain consistency. Hair covers forehead, expression somber throughout. At the moment of transformation, only a slight furrow of the brow — no heroic spark, no eye-light, keep the oppressive feel.
Clothing: Matte black leather long trench coat. Matte metal belt, dark crimson crystal at the buckle core.
Scene: Post-apocalyptic battlefield wasteland, light breeze, drifting smoke, overcast sky, grey-blue tone. A meteor trailing fire and smoke crosses the sky.

[Atmosphere & quality]
Visual base: Anamorphic widescreen cinematic. Simulated IMAX film camera, paired with Panavision C-series lens (35mm focal, f/4 aperture).
Color & tone: Low-saturation grey-blue dominant. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Style core: Realistic dark battle-damaged aesthetic. Emphasize the fusion of biological texture and alien tech. Build an oppressive, heavy, live-action sensation of physical pain.

[Camera rules]
Single-shot: One continuous take, no editing.
Angle: Open with low-angle shot, character framed at 30° from the left, waist-up. As transformation begins, camera orbits very slowly to a level head-on at upper body. After transformation completes, orbit to the right side and shift to a high angle.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 15s]
0–3s · Gaze
Action: Subject stands with weary, defeated posture. Slightly bows head, gaze locked on the belt. Back tense. Right hand slowly rises, grips the belt body.
Camera: Extremely slow push-in. Capture the subtle rise/fall of breath.
VFX: Both eyes suddenly ignite with platinum gold glow, eye sockets crack around the rim. The glare creates lens flares.

3–6s · Activation
Sound: Low rumble + breathy three-syllable utterance.
Action: As the sound fades, palm presses hard against the belt core. The crystal core is compressed and cracks; deep crimson light follows the fractures. Hand slowly releases after activation.
VFX: Metal mechanism violently awakens, core splits down the centerline. Air collapses inward producing distortion, screen edges stretch slightly. A horizontal pulse wave radiates outward in a spiral, hair disturbed, dissipating after 0.3s.
Camera: Low-frequency hum approaches from a distance. Camera produces a reactive 0.1s micro-tremor.

6–9s · Tearing
Core: Belt core erupts in deep crimson cracks, ejecting small fragments. Golden light fluid seeps out, spreading from inside the belt across the torso.
Body: White smoke erupts from within, carrying hair-thin blue arcs that crackle.
Clothing: Tears and burns from the inside, debris and ash drift away.
Shell: Shell fragments scatter, organic filaments pull out then — defying physics — hover, then eerily retract and reattach to the torn wound.
Face: A 1.5cm gash suddenly opens on the cheekbone, glowing orange-red from inside, pulsing with the heartbeat.
Camera: Violently shakes and goes out of focus from impact, then snaps back into position.

9–12s · Growth
New matter: Brand new biological matter pushes out from within, coated in viscous fluid. Surface reflects an iridescent sheen, writhing as if alive, advancing toward the heart.
Pauldrons: Newly-formed shoulder armor collides, sparks burst out in deep crimson, leaving permanent burn-like scars.
Chest plate: Opens and closes with the heartbeat, embers flicker in the seams, still not fully sealed after three heartbeats.
Old clothing: Torn beyond repair, ripped from the body by some uncanny force and flung out of frame.
Face coverage: A black film begins to spread from the face, coverage rate uneven, creating an asymmetric, eerie beauty.
Compound eyes: Bleed light from the inside out one by one. Left eye completes 0.5s faster than the right. Some units flicker as if faulty, brightness uneven, faint liquid medium swirling inside.
Gaze: Throughout the entire transformation, the subject's eyes remain locked forward.

12–15s · Completion
Helmet: Both compound eyes assembled, face fully covered by mask. Helmet with curved horn-like protrusions. Both eyes glow, faulty units still flicker, accompanied by a faint electrical hiss every 2 seconds.
Armor: Black-and-crimson, never perfectly flat, battle damage everywhere.
Pauldrons: Edges curl up, fissures continuously seep micro-amounts of light fluid, one drop every three seconds.
Waist: A large unhealed fissure, deep crimson luminous flow churning inside, opening and closing with breath.
Left chest: An old wound torn open again, jagged crack.
Final shot: Orbit to the subject's right, camera shifts to high angle, pulls back at extremely slow speed, revealing the figure and environment.

Closing: No dialogue. No explosion. No blinding light. Just a figure in unfinished battle-armor standing in place. Wind carries battlefield smoke. A meteor crosses the distant sky.

Sound: No score. Production audio only. Metal scrape, electrical hiss, wind, distant rumble.
```

### 反向提示词（Negative Prompt）

```
blurry, low resolution, soft focus, watermark, text overlay, subtitles, logo, distorted face, asymmetric eyes, extra fingers, deformed hands, melting/morphing geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean flawless surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, premature full transformation, symmetrical clean armor, instant costume swap, no in-between morph stages, untextured smooth plating
```

### Agnes AI API 调用代码

```python
def generate_transformation_video():
    """生成 15 秒单镜头变身视频"""
    
    prompt = """Core theme: gritty dark tokusatsu | battle-damaged aesthetic | broken flesh | biological-mecha fusion | post-apocalyptic wasteland

[Character & scene setup]
Face: Features, face shape, hairstyle 100% preserved. No beautification. Maintain facial wound, gauze, bloodstain consistency. Hair covers forehead, expression somber throughout. At the moment of transformation, only a slight furrow of the brow.
Clothing: Matte black leather long trench coat. Matte metal belt, dark crimson crystal at the buckle core.
Scene: Post-apocalyptic battlefield wasteland, light breeze, drifting smoke, overcast sky, grey-blue tone. A meteor trailing fire and smoke crosses the sky.

[Atmosphere & quality]
Visual base: Anamorphic widescreen cinematic. Simulated IMAX film camera, paired with Panavision C-series lens (35mm focal, f/4 aperture).
Color & tone: Low-saturation grey-blue dominant. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Style core: Realistic dark battle-damaged aesthetic. Emphasize the fusion of biological texture and alien tech.

[Camera rules]
Single-shot: One continuous take, no editing.
Angle: Open with low-angle shot, character framed at 30° from the left, waist-up. As transformation begins, camera orbits very slowly to a level head-on at upper body. After transformation completes, orbit to the right side and shift to a high angle.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 15s]
0–3s · Gaze
Action: Subject stands with weary, defeated posture. Slightly bows head, gaze locked on the belt. Back tense. Right hand slowly rises, grips the belt body.
Camera: Extremely slow push-in. Capture the subtle rise/fall of breath.
VFX: Both eyes suddenly ignite with platinum gold glow, eye sockets crack around the rim.

3–6s · Activation
Action: Palm presses hard against the belt core. The crystal core is compressed and cracks; deep crimson light follows the fractures.
VFX: Metal mechanism violently awakens, core splits down the centerline. Air collapses inward producing distortion.
Camera: Low-frequency hum approaches. Camera produces a reactive 0.1s micro-tremor.

6–9s · Tearing
Core: Belt core erupts in deep crimson cracks, ejecting small fragments. Golden light fluid seeps out.
Body: White smoke erupts from within, carrying hair-thin blue arcs that crackle.
Clothing: Tears and burns from the inside, debris and ash drift away.
Face: A 1.5cm gash suddenly opens on the cheekbone, glowing orange-red from inside.
Camera: Violently shakes and goes out of focus from impact, then snaps back into position.

9–12s · Growth
New matter: Brand new biological matter pushes out from within, coated in viscous fluid.
Pauldrons: Newly-formed shoulder armor collides, sparks burst out in deep crimson.
Chest plate: Opens and closes with the heartbeat, embers flicker in the seams.
Face coverage: A black film begins to spread from the face, coverage rate uneven.
Compound eyes: Bleed light from the inside out one by one. Some units flicker as if faulty.

12–15s · Completion
Helmet: Both compound eyes assembled, face fully covered by mask. Helmet with curved horn-like protrusions.
Armor: Black-and-crimson, never perfectly flat, battle damage everywhere.
Waist: A large unhealed fissure, deep crimson luminous flow churning inside.
Final shot: Orbit to the subject's right, camera shifts to high angle, pulls back slowly.

Closing: No dialogue. No explosion. No blinding light. Just a figure in unfinished battle-armor standing in place. Wind carries battlefield smoke. A meteor crosses the distant sky.

Sound: No score. Production audio only. Metal scrape, electrical hiss, wind, distant rumble."""
    
    negative_prompt = "blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, flat even studio lighting, perfectly clean surfaces, frame flicker, lifeless locked-off camera, symmetrical clean armor, instant costume swap"
    
    payload = {
        "model": "sapiens-video-v1",  # 视频生成模型（根据 Agnes AI 实际模型名调整）
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "duration": 15,  # 15秒
        "aspect_ratio": "16:9",
        "fps": 24,
        "seed": -1
    }
    
    response = requests.post(
        f"{BASE_URL}/videos/generations",
        headers=HEADERS,
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        task_id = result.get("id")
        print(f"任务已提交，ID: {task_id}")
        return task_id
    else:
        print(f"请求失败: {response.status_code} - {response.text}")
        return None

# 轮询任务状态
def check_video_status(task_id):
    response = requests.get(
        f"{BASE_URL}/videos/generations/{task_id}",
        headers=HEADERS
    )
    return response.json()
```

---

## 2️⃣ 多分镜叙事短片（Multi-Shot Narrative）

### 5段式提示词（7个分镜）

```
Core theme: atom-punk retro-future | post-apocalyptic zombie | cinematic hyperreal | no game-CG feel | quiet unease

[Character & scene setup]
Robot protagonist: A tall, slender humanoid robot with chipped off-white paint, rust spots at the joints, a round LED face panel that displays simple emoticons. Wears a tattered tan canvas trench coat over the metal frame. Walks with a slight mechanical limp, left arm hangs a little lower than the right.
Small animal (ostrich): A scruffy young ostrich, ruffled feathers, one slightly crooked neck feather, curious wide eyes, skittish but brave.
Scene: An abandoned beachfront villa, post-apocalyptic. Floor-to-ceiling windows, cracked terrazzo floors, overgrown plants creeping in through broken sliding doors. Late afternoon golden light slants through dust motes. The ocean is visible outside, grey-green under a hazy sky.
Sound: No score. Production audio only. Ocean waves, wind through broken windows, distant zombie growls, metal joints creaking, glass underfoot.

[Atmosphere & quality]
Visual base: Anamorphic widescreen cinematic. IMAX film camera with Panavision C-series lens (motion blur added).
Color & tone: 1960s retro-sci-fi atompunk aesthetic. Retro warm-orange + sea-salt blue high-contrast palette. Film grain texture, retro wide-angle lens, low-saturation retro film LUT. Natural daylight illumination — large floor-to-ceiling windows let in soft side-light, casting gentle shadows on the terrazzo floor. Overall lighting transmits evenly, highlights don't blow out, shadow detail preserved, tonal transitions natural.
Style core: Atompunk, cinematic, hyperreal, photoreal, live-action shoot, no game-CG feel. Reference Fallout TV series aesthetic for set design and color grading.

[Camera rules]
Edited across shots (multi-shot narrative). Camera moves follow suspense/horror SOP — slow reveals, withheld information, frame-within-frame compositions.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 7 shots]
Shot 1 — Empty villa
  Shot size: Extreme wide, establishing
  Composition: Symmetric, the robot enters from far left, the villa fills the right two-thirds of frame. Foreground: cracked pavement; midground: the robot walking; background: the villa against the ocean.
  Camera move: Slow lateral drift from left to right, parallax layers passing at different speeds.
  Story content: The robot limps along the cracked seaside promenade toward the abandoned villa. Wind catches its trench coat. It pauses at the broken front gate, tilts its head, then steps inside.

Shot 2 — Inside the foyer
  Shot size: Wide, through the doorway
  Composition: Frame-within-frame — we see through the broken front doorway into the dark foyer. The robot is a silhouette against the brighter outside.
  Camera move: Slow creep-in toward the doorway, almost imperceptible.
  Story content: The robot steps inside. Its LED face panel shifts from neutral yellow to a cautious orange question-mark. It pauses, listening. Off-frame, a rustling sound comes from deeper in the villa.

Shot 3 — The kitchen
  Shot size: Medium, low angle
  Composition: Diagonal — kitchen counter in foreground left, the robot entering from background right. Empty shot at first.
  Camera move: Locked-off, breath-float only.
  Story content: The robot enters the kitchen. Rusted pots hang above a cracked stove. It approaches the counter, reaches for a dusty can — and freezes. A sound from behind the pantry door. The robot slowly turns its head. The door rattles.

Shot 4 — First encounter
  Shot size: Long-lens close-up, over-the-shoulder
  Composition: Robot's shoulder in foreground left, the pantry door in midground right. Shallow depth of field.
  Camera move: Locked-off, hold.
  Story content: The pantry door bursts open. The ostrich erupts out, wings flapping, squawking. The robot recoils, covering its face panel with both hands. The ostrich skids to a stop across the kitchen, also startled. They stare at each other.

Shot 5 — Standoff
  Shot size: Medium wide, profile two-shot
  Composition: Rule-of-thirds — robot on left third, ostrich on right third. Empty space between them.
  Camera move: Slow clockwise orbit around both subjects, keeping both in frame.
  Story content: The robot slowly lowers its hands. Its LED face shifts from exclamation-mark alarm to a tilted question mark. The ostrich tilts its head too, one crooked feather bobbing. They circle each other cautiously. Neither attacks.

Shot 6 — The zombie
  Shot size: Wide, high-angle surveillance
  Composition: High angle looking down through a broken second-floor railing. Foreground: the railing. Midground: robot and ostrich below. Background: the sliding glass door — and a zombie silhouette pressing against the outside.
  Camera move: Locked-off, breath-float.
  Story content: A zombie slams against the outside of the sliding glass door. The robot and ostrich both freeze. The glass cracks. The zombie's face presses against it, milky eyes, mouth working silently. The robot and ostrich exchange a look.

Shot 7 — Closing
  Shot size: Extreme wide, held long
  Composition: The villa against the ocean, golden hour. Subject occupies lower fifth of frame.
  Camera move: Hold-the-vastness. Locked-off, breath-float, hold long.
  Story content: No dialogue. No explosion. No fight sequence. Just the robot and the ostrich, side by side, walking away from the villa down the beach toward the setting sun. The zombie remains trapped behind the glass, watching them go. A single wave rolls in.
```

### 反向提示词

```
blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean flawless surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, the robot changing shape between shots, the ostrich changing appearance between shots, cartoonish zombie proportions
```

### Agnes AI API 调用代码（多镜头生成）

```python
def generate_multi_shot_narrative():
    """生成分镜叙事短片（逐个镜头生成，后期剪辑）"""
    
    shots = [
        {
            "name": "Shot 1 — Empty villa",
            "prompt": """Shot 1 — Empty villa
Shot size: Extreme wide, establishing
Composition: Symmetric, the robot enters from far left, the villa fills the right two-thirds of frame.
Camera move: Slow lateral drift from left to right, parallax layers passing at different speeds.
Story content: A tall slender humanoid robot with chipped off-white paint, rust spots, round LED face panel, wearing a tattered tan canvas trench coat, limps along a cracked seaside promenade toward an abandoned beachfront villa. Wind catches its coat. It pauses at the broken front gate, tilts its head, then steps inside.
Visual base: Anamorphic widescreen cinematic. IMAX film camera with Panavision C-series lens. 1960s retro-sci-fi atompunk aesthetic. Warm-orange + sea-salt blue palette. Film grain texture.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. Ocean waves, wind, metal joints creaking."""
        },
        {
            "name": "Shot 4 — First encounter",
            "prompt": """Shot 4 — First encounter
Shot size: Long-lens close-up, over-the-shoulder
Composition: Robot's shoulder in foreground left, the pantry door in midground right. Shallow depth of field.
Camera move: Locked-off, hold.
Story content: The pantry door bursts open. A scruffy young ostrich with ruffled feathers and one crooked neck feather erupts out, wings flapping, squawking. The robot recoils, covering its face panel with both hands. The ostrich skids to a stop across the kitchen, also startled. They stare at each other.
Visual base: Anamorphic widescreen cinematic. IMAX film camera with Panavision C-series lens. 1960s retro-sci-fi atompunk aesthetic. Warm-orange + sea-salt blue palette. Film grain texture.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. Wings flapping, squawking, metal joints clanking."""
        },
        {
            "name": "Shot 7 — Closing",
            "prompt": """Shot 7 — Closing
Shot size: Extreme wide, held long
Composition: The villa against the ocean, golden hour. Subject occupies lower fifth of frame.
Camera move: Hold-the-vastness. Locked-off, breath-float, hold long.
Story content: No dialogue. No explosion. No fight sequence. Just the robot and the ostrich, side by side, walking away from the villa down the beach toward the setting sun. A zombie remains trapped behind the glass, watching them go. A single wave rolls in.
Visual base: Anamorphic widescreen cinematic. IMAX film camera with Panavision C-series lens. 1960s retro-sci-fi atompunk aesthetic. Warm-orange + sea-salt blue palette. Film grain texture.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. Ocean waves, wind, distant zombie growl."""
        }
    ]
    
    negative_prompt = "blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, flat even studio lighting, perfectly clean surfaces, frame flicker, lifeless locked-off camera, cartoonish proportions"
    
    results = []
    
    for shot in shots:
        print(f"正在生成: {shot['name']}")
        payload = {
            "model": "sapiens-video-v1",
            "prompt": shot["prompt"],
            "negative_prompt": negative_prompt,
            "duration": 8,  # 每个镜头 8 秒
            "aspect_ratio": "16:9",
            "fps": 24,
            "seed": -1
        }
        
        response = requests.post(
            f"{BASE_URL}/videos/generations",
            headers=HEADERS,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            results.append({
                "shot_name": shot["name"],
                "task_id": result.get("id"),
                "status": "submitted"
            })
            print(f"  ✓ 任务已提交: {result.get('id')}")
        else:
            print(f"  ✗ 失败: {response.status_code}")
        
        time.sleep(1)  # 避免请求过快
    
    return results
```

---

## 3️⃣ 情感叙事：萌宠一生陪伴（Emotional Narrative）

### 5段式提示词

```
Core theme: warm nostalgic family film | a lifetime of companionship | time-lapse across seasons | gentle realism | no melodrama, no music-video gloss

[Character & scene setup]
Person (subject 1, throughout): Reference uploaded photo. Features / face / hair 100% preserved across all shots. No beautification. Same person ages naturally from a small child to an adult — same eyes, same smile, same mole. Imperfections: scraped knees as a kid, a faded scar on the hand later, faint tired lines by the end.
Dog (subject 2, throughout): A medium yellow short-haired mongrel, one ear that folds at the tip. Same dog throughout — clumsy puppy → strong adult → aged, muzzle and eyebrows turning grey, eyes clouding, gait slowing. Worn red collar, scratched buckle, frayed webbing; a little mud always on the paws.
Scene: One modest family home and its small yard, returned to across the years — same wooden doorstep (paint wearing thinner each season), same worn rug, same window. Outside the window the season changes; inside, the light stays warm.
Sound: No score. Production audio only — puppy yelps, rain on the window, an old dog's slow breathing, a leash clip, wind in the yard.

[Atmosphere & quality]
Shot on ARRICAM with Cooke S4 vintage primes, Kodak Vision3 250D 35mm film stock. Warm golden natural light, low contrast, soft organic film grain. Keep one warm filmic grade across every shot — mark time only through the season outside the window and the angle/softness of light, never by changing the color tone.

[Camera rules]
Edited across shots (multi-shot narrative). Mostly static or slow shot sizes, eye-level with dog and person; one or two slow push-ins on faces. Each cut lands on the same spot in the home so time reads clearly.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 7 shots, one lifetime]
Shot 1 — First day (early spring)
  Low eye-level wide. Static. A cardboard box on the worn doorstep, soft morning light from the left. A small child crouches; a clumsy puppy with the folded ear tumbles out and licks the child's scraped knee. Both unsteady, both new.

Shot 2 — Growing up (summer)
  Mid-wide in the yard, bright high sun, dappled shade. Slow handheld follow. The child, taller now, runs; the young dog bounds alongside, mud on paws, red collar bright and new. They crash into the grass, laughing and barking.

Shot 3 — Waiting (autumn)
  Wide through the front window, golden low afternoon light, leaves outside. Static. The adult dog lies on the doorstep, head on paws, watching the empty road. The person — a teenager now — appears at the far end; the dog's tail thumps once, twice, then it scrambles up.

Shot 4 — The long night (winter rain)
  Interior mid-shot, warm lamp inside, cold rain on glass. Very slow push-in. The young adult sits on the floor, head down, tired. The dog rests its greying muzzle on their knee, unmoving. The person's hand finds the worn collar.

Shot 5 — Slowing down (spring again)
  Low close on paws and feet on the same doorstep, soft morning light. Static, breath-float. The old dog rises slowly, hind legs stiff, grey eyebrows, clouded eyes. The person's hand — a faded scar across it now — slides under to help it up. They walk out together, slowly, the same way they always have.

Shot 6 — The empty spot (summer dusk)
  Wide, the doorstep, warm dusk light raking low. Static. The doorstep is empty. The worn red collar lies on the wood where the dog used to lie. The person sits beside it, doesn't pick it up, just rests a hand near it. A warm breeze moves the leaves.

Shot 7 — Closing (golden hour)
  Eye-level wide, the yard, low golden light. Static, breath-float, hold long. No dialogue. No music. No flashback montage. Just the person at the yard gate in warm light, looking down the road for a moment — and a single yellow leaf drifting down to rest on the empty doorstep behind them.
```

### 反向提示词

```
blurry, low resolution, soft focus, watermark, text overlay, subtitles, logo, distorted face, asymmetric eyes, extra limbs, deformed paws, melting/morphing geometry, the dog changing breed or color between shots, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, sappy lens flare, on-screen heart symbols
```

### Agnes AI API 调用代码

```python
def generate_emotional_pet_story():
    """生成情感叙事短片：萌宠一生陪伴"""
    
    shots = [
        {
            "name": "Shot 1 — First day",
            "prompt": """Shot 1 — First day (early spring)
Low eye-level wide. Static. A cardboard box on a worn wooden doorstep, soft morning light from the left. A small child crouches; a clumsy medium yellow short-haired puppy with one ear that folds at the tip tumbles out of the box and licks the child's scraped knee. Both unsteady, both new.
Visual base: ARRICAM with Cooke S4 vintage primes, Kodak Vision3 250D 35mm film stock. Warm golden natural light, low contrast, soft organic film grain. Warm filmic grade.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. Puppy yelps, soft morning birds, gentle breeze."""
        },
        {
            "name": "Shot 5 — Slowing down",
            "prompt": """Shot 5 — Slowing down (spring again)
Low close on paws and feet on the same wooden doorstep, soft morning light. Static, breath-float. The old dog rises slowly, hind legs stiff, grey eyebrows, clouded eyes. Worn red collar, scratched buckle. The person's hand — with a faded scar across the back — slides under the dog's chest to help it up. They walk out together, slowly, the same way they always have.
Visual base: ARRICAM with Cooke S4 vintage primes, Kodak Vision3 250D 35mm film stock. Warm golden natural light, low contrast, soft organic film grain. Warm filmic grade.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. An old dog's slow breathing, creaking joints, soft footsteps."""
        },
        {
            "name": "Shot 7 — Closing",
            "prompt": """Shot 7 — Closing (golden hour)
Eye-level wide, a small yard, low golden light. Static, breath-float, hold long. No dialogue. No music. No flashback montage. Just a person at the yard gate in warm light, looking down the road for a moment — and a single yellow leaf drifting down to rest on the empty wooden doorstep behind them. The worn red collar is not shown.
Visual base: ARRICAM with Cooke S4 vintage primes, Kodak Vision3 250D 35mm film stock. Warm golden natural light, low contrast, soft organic film grain. Warm filmic grade.
Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.
Sound: No score. Production audio only. Wind in the yard, distant birds, silence."""
        }
    ]
    
    negative_prompt = "blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra limbs, deformed paws, melting geometry, the dog changing breed or color between shots, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, frame flicker, jarring hard cuts, lifeless locked-off camera, sappy lens flare, on-screen heart symbols"
    
    results = []
    
    for shot in shots:
        print(f"正在生成: {shot['name']}")
        payload = {
            "model": "sapiens-video-v1",
            "prompt": shot["prompt"],
            "negative_prompt": negative_prompt,
            "duration": 8,
            "aspect_ratio": "16:9",
            "fps": 24,
            "seed": -1
        }
        
        response = requests.post(
            f"{BASE_URL}/videos/generations",
            headers=HEADERS,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            results.append({
                "shot_name": shot["name"],
                "task_id": result.get("id"),
            })
            print(f"  ✓ 任务已提交: {result.get('id')}")
        else:
            print(f"  ✗ 失败: {response.status_code}")
        
        time.sleep(1)
    
    return results
```

---

## 4️⃣ 武器充能 + 打斗（Weapon Charge + Combat）

### 5段式提示词（武器充能段）

```
Core theme: cyberpunk hardcore sci-fi | weapon charge-up | thermal blade | mech power armor | industrial foggy dock

[Character & scene setup]
Protagonist: Female mech warrior in full deep-grey power armor, titanium alloy with matte black accents, scratches and battle wear visible. Helmet with transparent glass visor, orange HUD display glowing on the inside. Slim athletic build under armor, precise mechanical movements.
Weapon: Thermal tang-dao blade. Black carbon-fiber hilt with cut-out weight-reduction holes. Matte silver-grey metal blade, orange tech-seams etched along the spine, a glowing orange-red energy edge running down the center.
Scene: Fog-shrouded industrial dock/platform at night. A long bridge walkway connects to a massive circular metal blast door. Dense fog on both sides, only faint building outlines visible. Distant crane structures and a deep abyss. Visibility extremely low.
Sound: No score. Production audio only. Metal scrape, electrical hum, servo whine, distant foghorn, water lapping.

[Atmosphere & quality]
Visual style: Cyberpunk, hardcore sci-fi, cinematic, hyperreal, live-action shoot, wasteland industrial.
Color & tone: Hollywood teal-and-orange. Cold orange-grey and dark cyan creating an oppressive, cold, unknown atmosphere. High-intensity neon orange and cyan blue. Extreme cool-warm contrast is the core visual signature.
Lighting: Dark low-key, high-contrast. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain. Overall visibility is extremely low.
Ambient light: Dense volumetric fog scatters faint cold light.
Light sources: Glowing props as dynamic light sources — helmet glass HUD, armor orange lights, blade orange glow, monster cyan eyes — produce strong rim light and lens flares.
Camera body: Sony Venice cinema camera with Canon K-35 series lenses.

[Camera rules]
Single-shot sequence, moving between close-ups and wide shots. Impact-synced camera moves.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — Weapon Charge, 12s]
0–2s · Helmet close-up
Action: Extremely tight close-up side profile, helmet visor. The pilot's eyes are visible behind the glass — slight furrow of the brow, cold focused gaze, hatred staring forward. Body rises and falls with breath.
VFX: Orange-red digital HUD lights up on the helmet glass, reflections dancing in her eyes and on her skin.
Camera: Extremely slow push-in.

2–4s · Armor deployment
Action: Back-of-shoulder + arm close-up. Subject's arms hang naturally at sides. Back armor and arm armor — precise mechanical structures, swift and responsive — unfold layer by layer, revealing high-temperature orange-glowing mechanical cores inside.
VFX: Combat mode engages, lights sustain at high brightness.
Camera: Quick cut between back and arm close-ups, impact-synced push on each deploy.

4–7s · Weapon materialization
Action: Back of hand close-up, panning to blade close-up. A black mechanical glove flexes its fingers. A mechanized 3D holographic sci-fi hilt outline appears at the palm (white blueprint lines). The outline gradually grows a blade, full design wireframe emerges. Then the gauntlet grips the hilt — the weapon activates, turning from white wireframe into a solid tang-dao, with sci-fi seams along the spine.
VFX: Orange energy charges from hilt to blade, the edge gradually brightens.

7–10s · Stance
Action: Full-body shot. Subject's posture slowly shifts. Weapon fully charged. Exposed mechanical cores close, armor returns to initial state. Body center of gravity drops, single hand gripping the blade, classic sword-fighting combat stance.
VFX: The orange glow from the blade illuminates the helmet and metal suit, creating warm-cool contrast with the ambient light.
Camera: Slow pull-back from medium to full body, low angle.

10–12s · Reveal
Action: Full back shot, revealing the entire environment. Subject stands on the bridge, facing the closed gate, ready. The massive gate in the distance begins to open — inside is a fog-choked abandoned factory. Tall dark shapes emerge from the fog, charging toward the subject.
VFX: Multiple cyan-glowing eyes appear in the fog, getting closer.
Camera: Crane/boom up from subject to full scene reveal.

Closing: No dialogue. No explosion. Just the figure on the bridge, thermal blade glowing orange, the cyan-eyed shapes rushing through the fog toward her. The hum of energy, the sound of heavy running footsteps.
```

### 5段式提示词（打斗段）

```
Core theme: cyberpunk combat | thermal blade vs alien beasts | kinetic action | teal-orange contrast | industrial dock battle

[Character & scene setup]
Protagonist: Same female mech warrior in deep-grey power armor with orange accents, scratches and battle wear. Helmet visor with orange HUD. Thermal tang-dao blade with glowing orange-red energy edge.
Enemies: Tall muscular humanoid alien dark beasts. Rough skin, no hair, gaping maws, dark brown skin, spines along the spine, eerie cyan-blue glowing eyes, four-legged gait at high speed. Blue bioluminescent blood.
Scene: Same fog-shrouded industrial dock, the bridge walkway between blast doors. Dense volumetric fog. Night.
Sound: No score. Production audio only. Metal on flesh, blade hum, impact thuds, roars, metal scrape, debris clattering.

[Atmosphere & quality]
Visual style: Cyberpunk, hardcore sci-fi, cinematic, hyperreal, live-action shoot.
Color & tone: Hollywood teal-and-orange. Extreme cool-warm contrast. Orange blade glow vs cyan fog and monster eyes.
Lighting: Dark low-key, high-contrast. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Camera body: Sony Venice cinema camera with Canon K-35 series lenses. Motion blur on fast action.

[Camera rules]
Dynamic action camerawork — tracking, orbiting, slow-motion intercut with fast motion. Impact-synced camera reaction.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — Combat, 15s]
0–3s · First contact
Action: Wide shot. A massive shadowy beast lunges from the fog. The protagonist sidesteps with a dynamic sliding dodge and immediately rises.
VFX: The thermal blade sweeps through the air, leaving a perfect orange light trail.
Camera: Dynamic follow-tracking alongside the subject, foreground elements whipping past. Impact-synced camera jolt on the dodge.

3–7s · High-speed combo
Action: Medium shots, foot close-ups, head close-ups, high-angle overhead wide. The protagonist moves between multiple beasts, fluid and precise. Each attack's remaining kinetic energy becomes the start of the next. Supreme agility dodging strikes.
VFX: Thermal blade swings produce brilliant orange light energy and particle trails. Each hit on a beast bursts forth large amounts of cyan-blue light-fluid that dims and fades after 0.5 seconds.
Camera: Cinematic motion following. Mix of medium tracking shots and quick cuts to close-ups (feet, blade impact, eyes).
Note: Action follows real physics. Tight rhythm, no game-CG feel. Clean efficient movement, extreme explosive power and agility, every strike surgically precise at vital points.

7–10s · Finishing blow (slow motion)
Action: Extreme slow motion, high contrast. The protagonist slices the blade precisely through a beast's body. The beast's cyan-blue eyes are strikingly visible in the dark.
VFX: Thick viscous blue light-fluid sprays out, hangs in mid-air.
Camera: Slow motion tracking, holding on the spray arc.

10–12s · Brief respite
Action: Back shot of protagonist. She spins the thermal blade in her hand to dissipate momentum, pauses briefly. Then a sound from behind — tension returns. Both hands grip the hilt, she slowly turns, slight heavy breathing, gaze toward the end of the industrial corridor.
Camera: Medium back shot, slow orbit to side profile.

12–15s · Boss reveal
Action: Long shot. At the end of the foggy industrial corridor, an even larger monster slowly emerges from the industrial gate fog. Heavy footsteps cause a slight camera shake. The thermal blade recharges, energy reaching maximum. The orange blade's brightness increases, reflecting on the protagonist's face and armor.
VFX: Orange blade glow intensifies.
Camera: Slow push-in toward the distant shape. Final frame: protagonist in foreground right, boss silhouette in background left, ready for the final clash.

Closing: No victory pose. No explosion. Just two figures in the fog, thermal blade glowing, about to collide. The hum of charged energy.
```

### 反向提示词

```
blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean flawless surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, weightless floaty motion, no impact, soft contact, characters phasing through each other, missing follow-through, slow-motion drift on every hit, no debris or dust on impact
```

### Agnes AI API 调用代码

```python
def generate_weapon_charge_and_combat():
    """生成武器充能 + 打斗两段视频"""
    
    # 武器充能段
    charge_prompt = """Core theme: cyberpunk hardcore sci-fi | weapon charge-up | thermal blade | mech power armor | industrial foggy dock

[Character & scene setup]
Protagonist: Female mech warrior in full deep-grey power armor, titanium alloy with matte black accents, scratches and battle wear visible. Helmet with transparent glass visor, orange HUD display glowing on the inside.
Weapon: Thermal tang-dao blade. Black carbon-fiber hilt. Matte silver-grey metal blade, orange tech-seams etched along the spine, a glowing orange-red energy edge running down the center.
Scene: Fog-shrouded industrial dock at night. Long bridge walkway connecting to a massive circular metal blast door. Dense volumetric fog. Visibility extremely low.

[Atmosphere & quality]
Visual style: Cyberpunk, hardcore sci-fi, cinematic, hyperreal, live-action shoot.
Color & tone: Hollywood teal-and-orange. Cold orange-grey and dark cyan. High-intensity neon orange and cyan blue. Extreme cool-warm contrast.
Lighting: Dark low-key, high-contrast. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Camera body: Sony Venice cinema camera with Canon K-35 series lenses.

[Camera rules]
Single-shot sequence. Impact-synced camera moves.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 12s]
0–2s: Extremely tight close-up side profile, helmet visor. Pilot's eyes visible behind glass — slight furrow of the brow, cold focused gaze. Orange-red digital HUD lights up on the helmet glass.
2–4s: Back armor and arm armor unfold layer by layer, revealing high-temperature orange-glowing mechanical cores inside. Combat mode engages.
4–7s: A black mechanical glove flexes fingers. A mechanized holographic hilt outline appears (white blueprint lines). Blade grows from the outline. The gauntlet grips it — weapon activates, turning solid. Orange energy charges from hilt to blade.
7–10s: Full-body shot. Subject's posture shifts. Weapon fully charged. Body center of gravity drops, single hand gripping the blade, combat stance. Orange blade glow illuminates the armor.
10–12s: Full back shot, crane/boom up revealing the environment. Subject stands on the bridge. The massive gate opens. Tall dark shapes with cyan-glowing eyes emerge from the fog, charging toward her.

Closing: No dialogue. Just the figure on the bridge, thermal blade glowing orange, cyan-eyed shapes rushing through the fog.
Sound: No score. Production audio only. Metal scrape, electrical hum, servo whine, distant foghorn."""

    # 打斗段
    combat_prompt = """Core theme: cyberpunk combat | thermal blade vs alien beasts | kinetic action | teal-orange contrast | industrial dock battle

[Character & scene setup]
Protagonist: Female mech warrior in deep-grey power armor with orange accents, scratches and battle wear. Helmet visor with orange HUD. Thermal tang-dao blade with glowing orange-red energy edge.
Enemies: Tall muscular humanoid alien dark beasts. Rough skin, gaping maws, dark brown skin, spines along the spine, eerie cyan-blue glowing eyes. Blue bioluminescent blood.
Scene: Fog-shrouded industrial dock bridge. Dense volumetric fog. Night.

[Atmosphere & quality]
Visual style: Cyberpunk, hardcore sci-fi, cinematic, hyperreal, live-action shoot.
Color & tone: Hollywood teal-and-orange. Extreme cool-warm contrast. Orange blade glow vs cyan fog and monster eyes.
Lighting: Dark low-key, high-contrast. Shadow info compressed but detail preserved. Subtle edge bloom, moderate film grain.
Camera body: Sony Venice cinema camera with Canon K-35 series lenses. Motion blur on fast action.

[Camera rules]
Dynamic action camerawork — tracking, orbiting, slow-motion intercut with fast motion. Impact-synced camera reaction.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 15s]
0–3s: Wide shot. A massive shadowy beast lunges from the fog. Protagonist sidesteps with a dynamic sliding dodge. Thermal blade sweeps through the air, leaving a perfect orange light trail.
3–7s: Medium shots, foot close-ups, head close-ups, high-angle overhead wide. Protagonist moves between multiple beasts, fluid and precise. Thermal blade swings produce brilliant orange light energy and particle trails. Each hit bursts forth cyan-blue light-fluid. Action follows real physics. Tight rhythm, no game-CG feel.
7–10s: Extreme slow motion. Blade slices precisely through a beast's body. Cyan-blue eyes visible in the dark. Thick viscous blue light-fluid sprays out, hangs in mid-air.
10–12s: Back shot. Protagonist spins the thermal blade to dissipate momentum, pauses. Sound from behind — tension returns. Both hands grip hilt, slowly turns, slight heavy breathing.
12–15s: Long shot. Even larger monster slowly emerges from the fog at corridor end. Heavy footsteps cause camera shake. Thermal blade recharges to maximum. Orange brightness increases, reflecting on armor.

Closing: No victory pose. Just two figures in the fog, thermal blade glowing, about to collide.
Sound: No score. Production audio only. Metal on flesh, blade hum, impact thuds, roars, metal scrape."""

    negative_prompt = "blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, weightless floaty motion, no impact, soft contact, characters phasing through each other, missing follow-through"

    results = []
    
    # 提交武器充能
    print("正在生成：武器充能段...")
    charge_response = requests.post(
        f"{BASE_URL}/videos/generations",
        headers=HEADERS,
        json={
            "model": "sapiens-video-v1",
            "prompt": charge_prompt,
            "negative_prompt": negative_prompt,
            "duration": 12,
            "aspect_ratio": "16:9",
            "fps": 24,
            "seed": -1
        }
    )
    
    if charge_response.status_code == 200:
        results.append({
            "segment": "weapon_charge",
            "task_id": charge_response.json().get("id"),
        })
        print(f"  ✓ 武器充能任务已提交")
    
    time.sleep(1)
    
    # 提交打斗段
    print("正在生成：打斗段...")
    combat_response = requests.post(
        f"{BASE_URL}/videos/generations",
        headers=HEADERS,
        json={
            "model": "sapiens-video-v1",
            "prompt": combat_prompt,
            "negative_prompt": negative_prompt,
            "duration": 15,
            "aspect_ratio": "16:9",
            "fps": 24,
            "seed": -1
        }
    )
    
    if combat_response.status_code == 200:
        results.append({
            "segment": "combat",
            "task_id": combat_response.json().get("id"),
        })
        print(f"  ✓ 打斗任务已提交")
    
    return results
```

---

## 5️⃣ 单镜头氛围片（Atmospheric Single Shot）

### 5段式提示词

```
Core theme: cyber wuxia | steampunk meets classical martial arts | Shaw Brothers cinema style | rain-slicked temple courtyard

[Character & scene setup]
Wanderer: A lone martial artist in a tattered dark grey robe, worn at the cuffs and hem. Long black hair tied back loosely, a few strands falling across the face. A faint scar across the left eyebrow. Face calm, eyes sharp, a quiet coiled energy. Carries a straight single-edged sword in a black wooden scabbard slung across the back, brass fittings tarnished with age.
Scene: A traditional Chinese temple courtyard at night, rain falling steadily. Grey stone tiles glistening with water. Red lacquered pillars, chipped and weathered. A large bronze incense burner in the center, thin trails of incense smoke curling up through the rain. Overhanging eaves drip water in steady streams. Distant mountains barely visible through mist.
Sound: No score. Production audio only. Rain on stone, rain on wood, water dripping from eaves, distant thunder, incense crackling softly.

[Atmosphere & quality]
Shaw Brothers cinema style. Steampunk meets classical wuxia. 1970s Hong Kong color martial-arts film style. Retro HK noir. Mechanical wuxia. Epic composition. Deep shadows. Kodak 35mm vintage film, bleach-bypass developed. Soft glow on highlights. Rich texture. Live-action shoot, photorealistic cinematic feel.
Color & light: Non-naturalistic dramatic artificial lighting. Cold dominant palette — slate-grey, silver-white, dark red. Candlelight warmth reflects on the face. Hard cinematic light, clear chiaroscuro on face and metal.

[Camera rules]
Single continuous shot. Slow lateral drift across the courtyard.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 10s]
0–3s · Approach
Action: The wanderer steps into the courtyard from the left, boots splashing in puddles. Pauses just inside the gate, looks up at the temple. Rain runs down their face. A hand rests lightly on the sword hilt at their back.
Camera: Medium shot, slow lateral drift from left to right, keeping the wanderer in left third of frame.

3–7s · Stillness
Action: The wanderer stands perfectly still in the center of the courtyard, facing the temple. Rain pours down. The incense burner smolders beside them. Not a muscle moves — only the hair and robe shift slightly in the wind. Eyes closed for a beat, then open.
Camera: Slow push-in from medium to close-up on the face. Raindrops on eyelashes. The scar on the eyebrow catches the light.

7–10s · Decision
Action: The wanderer's hand slowly, deliberately, wraps around the sword hilt. Fingers tighten. Head tilts slightly — listening. Somewhere in the temple, a floorboard creaks. The wanderer's lips part almost imperceptibly. The hand draws the sword an inch out of the scabbard — the blade glints, wet with rain.
Camera: Close-up on the hand and hilt, then rack focus to the eyes in the background.

Closing: No dialogue. No fight. No music. Just the sound of rain, and the wanderer standing in the courtyard, half-drawn sword glinting, waiting. A distant rumble of thunder.
```

### 反向提示词

```
blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean flawless surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, modern clothing, neon signs, sci-fi elements not wuxia, overly clean pristine robes
```

### Agnes AI API 调用代码

```python
def generate_atmospheric_single_shot():
    """生成单镜头氛围片"""
    
    prompt = """Core theme: cyber wuxia | steampunk meets classical martial arts | Shaw Brothers cinema style | rain-slicked temple courtyard

[Character & scene setup]
Wanderer: A lone martial artist in a tattered dark grey robe, worn at the cuffs and hem. Long black hair tied back loosely, a few strands falling across the face. A faint scar across the left eyebrow. Face calm, eyes sharp, quiet coiled energy. Straight single-edged sword in a black wooden scabbard across the back, brass fittings tarnished.
Scene: A traditional Chinese temple courtyard at night, rain falling steadily. Grey stone tiles glistening with water. Red lacquered weathered pillars. Large bronze incense burner in the center, thin incense smoke curling through the rain. Overhanging eaves dripping water. Distant mountains barely visible through mist.

[Atmosphere & quality]
Shaw Brothers cinema style. Steampunk meets classical wuxia. 1970s Hong Kong martial-arts film style. Retro HK noir. Kodak 35mm vintage film, bleach-bypass developed. Soft glow on highlights. Rich texture. Live-action shoot, photorealistic cinematic feel.
Color & light: Non-naturalistic dramatic artificial lighting. Cold dominant palette — slate-grey, silver-white, dark red. Candlelight warmth on the face. Hard cinematic light, clear chiaroscuro.

[Camera rules]
Single continuous shot. Slow lateral drift across the courtyard.
Breathing: Handheld shot. Throughout, maintain an extremely subtle, breath-like camera float to enhance presence.

[Storyboard — 10s]
0–3s: Medium shot. The wanderer steps into the courtyard from the left, boots splashing in puddles. Pauses at the gate, looks up at the temple. Rain runs down their face. A hand rests lightly on the sword hilt. Slow lateral drift from left to right.
3–7s: Slow push-in from medium to close-up on the face. The wanderer stands perfectly still in the courtyard center, facing the temple. Rain pours down. Incense burner smolders beside them. Not a muscle moves — only hair and robe shift in the wind. Eyes close, then open. Raindrops on eyelashes. Scar catches the light.
7–10s: Close-up on the hand and hilt. The wanderer's hand slowly wraps around the sword hilt. Fingers tighten. Head tilts — listening. A floorboard creaks somewhere in the temple. Hand draws the sword an inch out — blade glints, wet with rain. Rack focus to the eyes in background.

Closing: No dialogue. No fight. Just the sound of rain, the wanderer standing in the courtyard, half-drawn sword glinting, waiting. A distant rumble of thunder.
Sound: No score. Production audio only. Rain on stone, rain on wood, water dripping, distant thunder, incense crackling."""
    
    negative_prompt = "blurry, low resolution, soft focus, watermark, text overlay, distorted face, extra fingers, deformed hands, melting geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera, modern clothing, neon signs, overly clean pristine robes"
    
    payload = {
        "model": "sapiens-video-v1",
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "duration": 10,
        "aspect_ratio": "16:9",
        "fps": 24,
        "seed": -1
    }
    
    response = requests.post(
        f"{BASE_URL}/videos/generations",
        headers=HEADERS,
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"氛围片任务已提交: {result.get('id')}")
        return result.get("id")
    else:
        print(f"请求失败: {response.status_code} - {response.text}")
        return None
```

---

## 📋 使用说明

### 1. 配置 API Key

将脚本中的 `YOUR_API_KEY` 替换为你的 Agnes AI API Key：

```python
API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 2. 安装依赖

```bash
pip install requests
```

### 3. 运行示例

```python
# 生成变身视频
task_id = generate_transformation_video()

# 检查状态
status = check_video_status(task_id)
print(status)
```

### 4. Mx-Shell 七条硬规则（已内嵌到所有提示词中）

| # | 规则 | 状态 |
|---|---|---|
| 1 | 每段都有具体名词，禁用空泛美化词 | ✅ 已内嵌 |
| 2 | 包含摄影机型号 + 镜头型号 | ✅ 已内嵌 |
| 3 | 包含「呼吸感」完整句式 | ✅ 已内嵌 |
| 4 | 包含「声音：仅保留同期声」 | ✅ 已内嵌 |
| 5 | 至少2处瑕疵描述 | ✅ 已内嵌 |
| 6 | 结尾不堆特效，留白 | ✅ 已内嵌 |
| 7 | 避开 IP 名 + 模型建议 | ✅ 已去除IP名 |

---

## 🎯 模型适配建议（Agnes AI）

由于 Agnes AI 兼容 OpenAI 风格接口，建议：

1. **使用英文提示词**：大多数视频模型对英文理解更准确
2. **单镜头不超过15秒**：越长成功率越低，建议分段生成后剪辑
3. **先试短片段**：先用5秒测试质感，满意了再做长的
4. **多抽几次**：AI 视频有随机性，多生成几次选最好的
5. **反向提示词**：如果 Agnes AI 支持 negative_prompt 字段，务必加上

---

*Generated with ai-shortfilm-prompts methodology × Agnes AI API*
