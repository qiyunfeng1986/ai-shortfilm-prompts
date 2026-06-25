const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';
const AGNES_API_KEY = process.env.AGNES_API_KEY || 'sk-kQmnO4IsMZ8c8dcBCQ5oJbElDYqy05rUPM9TUAp48QpRt3Bw';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const VIDEOS_DIR = path.join(UPLOAD_DIR, 'videos');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const STYLES = {
  wuxia: {
    id: 'wuxia',
    name: '武侠意境',
    description: '古典武侠雨夜庭院，电影级光影',
    imagePrompt: 'a lone martial artist in a flowing dark robe standing in a traditional Chinese temple courtyard at night, rain falling steadily, stone tiles glistening with water, red wooden pillars, large bronze incense burner with thin smoke, overhanging eaves dripping water, cinematic lighting, Kodak 35mm film look, moody atmosphere, photorealistic, 8k ultra detailed',
    videoPrompt: 'gentle rain falling, incense smoke curling upward, robe and hair swaying slightly in the breeze, water droplets dripping from eaves, subtle camera breathing float, cinematic mood, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-amber-500 to-red-600'
  },
  'cyberpunk-mecha': {
    id: 'cyberpunk-mecha',
    name: '赛博机甲',
    description: '赛博朋克女机甲战士，霓虹雨夜',
    imagePrompt: 'female mech pilot in sleek advanced power armor, metallic gunmetal grey with glowing cyan blue accents, helmet with transparent visor and HUD display, standing in industrial port at night, heavy rain, wet concrete reflecting neon lights, shipping containers, cinematic cyberpunk aesthetic, Sony Venice camera look, hyperrealistic, 8k',
    videoPrompt: 'heavy rain falling, armor energy lines pulsing gently, steam rising from wet surfaces, neon reflections rippling in puddles, subtle camera breathing motion, cinematic atmosphere, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-cyan-400 to-blue-600'
  },
  'scifi-transformation': {
    id: 'scifi-transformation',
    name: '科幻变身',
    description: '未来科技机甲觉醒，IMAX电影感',
    imagePrompt: 'person in sleek dark tactical suit standing in futuristic laboratory, floor-to-ceiling windows showing city skyline, ambient blue lighting, holographic displays floating around, about to activate armor transformation, cinematic IMAX quality, Panavision lens look, photorealistic, 8k ultra detailed',
    videoPrompt: 'armor plates forming and extending across the body, energy lines tracing along seams, chest core module glowing brighter, holographic displays shifting, subtle camera push-in and breathing float, cinematic sci-fi, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-blue-500 to-purple-600'
  },
  'cozy-pet': {
    id: 'cozy-pet',
    name: '治愈萌宠',
    description: '温暖治愈系人宠陪伴，阳光午后',
    imagePrompt: 'young person sitting on sunlit wooden floor with a fluffy golden retriever dog, cozy home interior, big windows with golden afternoon light streaming in, warm comfortable atmosphere, soft shadows, ARRICAM Cooke S4 vintage lens look, warm film grade, photorealistic, 8k',
    videoPrompt: 'gentle sunlight shifting, dog tail wagging slowly, soft breeze moving curtains, warm dust motes floating in sunbeams, subtle camera breathing, cozy warm atmosphere, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-yellow-400 to-orange-500'
  },
  'weapon-energy': {
    id: 'weapon-energy',
    name: '能量武器',
    description: '科幻能量武器充能，赛博朋克工业风',
    imagePrompt: 'armored figure holding an advanced energy blade weapon, dark tactical suit with amber accents, helmet with visor and HUD, industrial interior with dense atmospheric haze, dim amber warning lights, pipes and metal structures, cyberpunk aesthetic, cinematic close-up, Sony Venice look, hyperrealistic, 8k',
    videoPrompt: 'energy blade pulsing and glowing brighter, amber light shimmering along blade circuits, dust particles illuminated in the glow, mist swirling, subtle camera breathing and slow push-in, cinematic sci-fi, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-amber-400 to-red-500'
  },
  'ocean-sunset': {
    id: 'ocean-sunset',
    name: '海边日落',
    description: '绝美海边日落，电影级氛围',
    imagePrompt: 'lone figure standing on a cliff edge overlooking the ocean at golden hour sunset, wind blowing hair and clothing, dramatic clouds painted in orange and purple, waves crashing far below, cinematic wide shot, anamorphic lens flare, Panavision look, photorealistic, 8k ultra detailed',
    videoPrompt: 'waves rolling and crashing, hair and clothing blowing in the wind, clouds drifting slowly across the sky, sun gradually descending, subtle camera breathing and very slow push-in, epic cinematic atmosphere, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-orange-400 to-pink-500'
  },
  'fantasy-forest': {
    id: 'fantasy-forest',
    name: '奇幻森林',
    description: '魔法森林精灵，梦幻光影',
    imagePrompt: 'mystical forest scene with glowing fireflies and magical particles, ancient trees with moss and vines, soft ethereal light filtering through canopy, a hooded figure in flowing cloak standing by a glowing crystal pool, dreamlike fantasy atmosphere, cinematic lighting, photorealistic, 8k',
    videoPrompt: 'fireflies floating gently, magical particles drifting in the air, light rays shifting through trees, water surface rippling softly, subtle camera breathing and slow lateral drift, dreamlike fantasy, photorealistic, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-emerald-400 to-teal-500'
  },
  'anime-style': {
    id: 'anime-style',
    name: '动漫风格',
    description: '日系动漫风格，精美画风',
    imagePrompt: 'beautiful anime style illustration, young person with flowing hair standing on a school rooftop at sunset, dramatic sky with orange and pink clouds, wind blowing hair and uniform skirt, detailed artwork, Studio Ghibli inspired, vibrant colors, cinematic composition, high quality',
    videoPrompt: 'hair and clothing gently blowing in wind, clouds drifting across sunset sky, lens flare shifting subtly, cherry blossom petals floating by, slow subtle camera push-in, anime style, smooth animation, 24fps',
    imageSize: '1024x576',
    defaultSeconds: 5,
    gradient: 'from-pink-400 to-purple-500'
  }
};

let tasks = new Map();

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function downloadFile(url, destPath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  
  const writer = fs.createWriteStream(destPath);
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function generateImage(prompt, size = '1024x576') {
  const response = await axios.post(
    `${AGNES_BASE_URL}/images/generations`,
    {
      model: 'agnes-image-2.1-flash',
      prompt: prompt,
      size: size
    },
    {
      headers: {
        'Authorization': `Bearer ${AGNES_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.data.data && response.data.data.length > 0) {
    return response.data.data[0].url;
  }
  throw new Error('Image generation failed');
}

async function submitVideoGeneration(prompt, imageUrl, seconds = 5) {
  const response = await axios.post(
    `${AGNES_BASE_URL}/video/generations`,
    {
      model: 'agnes-video-v2.0',
      prompt: prompt,
      seconds: String(seconds),
      input_image: imageUrl
    },
    {
      headers: {
        'Authorization': `Bearer ${AGNES_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.id;
}

async function checkVideoStatus(taskId) {
  const response = await axios.get(
    `${AGNES_BASE_URL}/videos/${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${AGNES_API_KEY}`
      }
    }
  );
  
  return response.data;
}

async function processTask(taskId) {
  const task = tasks.get(taskId);
  if (!task) return;
  
  try {
    task.status = 'processing';
    task.progress = 5;
    task.stage = 'generating_image';
    tasks.set(taskId, task);
    
    const imageUrl = await generateImage(task.imagePrompt, task.imageSize);
    task.imageUrl = imageUrl;
    task.progress = 20;
    task.stage = 'image_completed';
    tasks.set(taskId, task);
    
    const imagePath = path.join(IMAGES_DIR, `${taskId}.png`);
    await downloadFile(imageUrl, imagePath);
    task.localImagePath = imagePath;
    tasks.set(taskId, task);
    
    task.stage = 'generating_video';
    task.progress = 30;
    tasks.set(taskId, task);
    
    const agnesTaskId = await submitVideoGeneration(task.videoPrompt, imageUrl, task.duration);
    task.agnesTaskId = agnesTaskId;
    tasks.set(taskId, task);
    
    const maxAttempts = 60;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 10000));
      attempts++;
      
      try {
        const status = await checkVideoStatus(agnesTaskId);
        task.progress = 30 + Math.floor((status.progress || 0) * 0.65);
        task.agnesStatus = status.status;
        
        if (status.status === 'completed') {
          task.videoUrl = status.remixed_from_video_id;
          task.progress = 95;
          task.stage = 'downloading';
          tasks.set(taskId, task);
          
          const videoPath = path.join(VIDEOS_DIR, `${taskId}.mp4`);
          await downloadFile(task.videoUrl, videoPath);
          task.localVideoPath = videoPath;
          
          const stats = fs.statSync(videoPath);
          task.size = formatFileSize(stats.size);
          
          task.status = 'completed';
          task.progress = 100;
          task.stage = 'completed';
          task.completedAt = new Date().toISOString();
          tasks.set(taskId, task);
          
          saveTasks();
          return;
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Video generation failed');
        }
        
        tasks.set(taskId, task);
      } catch (e) {
        console.error('Status check error:', e.message);
      }
    }
    
    throw new Error('Timeout waiting for video generation');
    
  } catch (error) {
    console.error('Task failed:', error);
    task.status = 'failed';
    task.error = error.message;
    task.progress = 0;
    tasks.set(taskId, task);
    saveTasks();
  }
}

function saveTasks() {
  const taskList = Array.from(tasks.values());
  fs.writeFileSync(
    path.join(UPLOAD_DIR, 'tasks.json'),
    JSON.stringify(taskList, null, 2)
  );
}

function loadTasks() {
  const tasksFile = path.join(UPLOAD_DIR, 'tasks.json');
  if (fs.existsSync(tasksFile)) {
    try {
      const taskList = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
      taskList.forEach(task => {
        tasks.set(task.id, task);
      });
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  }
}

loadTasks();

app.get('/api/styles', (req, res) => {
  const styleList = Object.values(STYLES).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    imageSize: s.imageSize,
    defaultSeconds: s.defaultSeconds,
    gradient: s.gradient
  }));
  res.json({ styles: styleList });
});

app.get('/api/videos', (req, res) => {
  const videoList = Array.from(tasks.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(t => ({
      id: t.id,
      style: t.style,
      styleName: t.styleName,
      status: t.status,
      progress: t.progress,
      stage: t.stage,
      imageUrl: t.imageUrl ? `/api/images/${t.id}.png` : null,
      videoUrl: t.localVideoPath ? `/api/videos/${t.id}/file` : (t.videoUrl || null),
      duration: t.duration,
      size: t.size || null,
      createdAt: t.createdAt
    }));
  res.json({ videos: videoList });
});

app.get('/api/videos/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  res.json({
    id: task.id,
    style: task.style,
    styleName: task.styleName,
    status: task.status,
    progress: task.progress,
    stage: task.stage,
    imageUrl: task.imageUrl ? `/api/images/${task.id}.png` : null,
    videoUrl: task.localVideoPath ? `/api/videos/${task.id}/file` : (task.videoUrl || null),
    duration: task.duration,
    size: task.size || null,
    createdAt: task.createdAt,
    prompt: task.imagePrompt,
    motionPrompt: task.videoPrompt,
    error: task.error || null
  });
});

app.get('/api/videos/:id/status', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  res.json({
    id: task.id,
    status: task.status,
    progress: task.progress,
    stage: task.stage,
    videoUrl: task.localVideoPath ? `/api/videos/${task.id}/file` : (task.videoUrl || null),
    error: task.error || null
  });
});

app.get('/api/videos/:id/file', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task || !task.localVideoPath) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  const videoPath = path.resolve(task.localVideoPath);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }
  
  res.sendFile(videoPath);
});

app.get('/api/images/:filename', (req, res) => {
  const imagePath = path.join(IMAGES_DIR, req.params.filename);
  const resolvedPath = path.resolve(imagePath);
  
  if (!resolvedPath.startsWith(path.resolve(IMAGES_DIR))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  if (fs.existsSync(resolvedPath)) {
    res.sendFile(resolvedPath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

app.post('/api/videos/generate', async (req, res) => {
  try {
    const { styleId, seconds, customPrompt } = req.body;
    
    if (!styleId || !STYLES[styleId]) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }
    
    const style = STYLES[styleId];
    const taskId = 'task_' + Math.random().toString(36).substring(2, 15);
    const duration = seconds || style.defaultSeconds;
    
    const task = {
      id: taskId,
      style: styleId,
      styleName: style.name,
      status: 'pending',
      progress: 0,
      stage: 'queued',
      imagePrompt: customPrompt || style.imagePrompt,
      videoPrompt: customPrompt ? customPrompt + ', ' + style.videoPrompt : style.videoPrompt,
      imageSize: style.imageSize,
      duration: duration,
      createdAt: new Date().toISOString(),
      imageUrl: null,
      videoUrl: null,
      localImagePath: null,
      localVideoPath: null,
      size: null,
      error: null
    };
    
    tasks.set(taskId, task);
    saveTasks();
    
    processTask(taskId);
    
    res.json({
      id: taskId,
      status: 'pending',
      style: styleId,
      styleName: style.name,
      createdAt: task.createdAt
    });
    
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos/image-to-video', async (req, res) => {
  try {
    const { imageUrl, motionPrompt, seconds } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const taskId = 'task_' + Math.random().toString(36).substring(2, 15);
    const duration = seconds || 5;
    
    const task = {
      id: taskId,
      style: 'custom',
      styleName: '自定义图生视频',
      status: 'pending',
      progress: 0,
      stage: 'queued',
      imagePrompt: '',
      videoPrompt: motionPrompt || 'subtle natural movement, cinematic, photorealistic, 24fps',
      imageSize: '1024x576',
      duration: duration,
      createdAt: new Date().toISOString(),
      imageUrl: imageUrl,
      videoUrl: null,
      localImagePath: null,
      localVideoPath: null,
      size: null,
      error: null,
      skipImageGeneration: true
    };
    
    tasks.set(taskId, task);
    saveTasks();
    
    (async () => {
      try {
        task.status = 'processing';
        task.progress = 30;
        task.stage = 'generating_video';
        tasks.set(taskId, task);
        
        const agnesTaskId = await submitVideoGeneration(task.videoPrompt, imageUrl, duration);
        task.agnesTaskId = agnesTaskId;
        tasks.set(taskId, task);
        
        const maxAttempts = 60;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 10000));
          attempts++;
          
          try {
            const status = await checkVideoStatus(agnesTaskId);
            task.progress = 30 + Math.floor((status.progress || 0) * 0.65);
            
            if (status.status === 'completed') {
              task.videoUrl = status.remixed_from_video_id;
              task.progress = 95;
              task.stage = 'downloading';
              tasks.set(taskId, task);
              
              const videoPath = path.join(VIDEOS_DIR, `${taskId}.mp4`);
              await downloadFile(task.videoUrl, videoPath);
              task.localVideoPath = videoPath;
              
              const stats = fs.statSync(videoPath);
              task.size = formatFileSize(stats.size);
              
              task.status = 'completed';
              task.progress = 100;
              task.stage = 'completed';
              task.completedAt = new Date().toISOString();
              tasks.set(taskId, task);
              saveTasks();
              return;
            } else if (status.status === 'failed') {
              throw new Error(status.error || 'Video generation failed');
            }
            
            tasks.set(taskId, task);
          } catch (e) {
            console.error('Status check error:', e.message);
          }
        }
        
        throw new Error('Timeout');
      } catch (error) {
        task.status = 'failed';
        task.error = error.message;
        tasks.set(taskId, task);
        saveTasks();
      }
    })();
    
    res.json({
      id: taskId,
      status: 'pending',
      createdAt: task.createdAt
    });
    
  } catch (error) {
    console.error('Image-to-video error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Agnes AI Video Workbench Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${UPLOAD_DIR}`);
  console.log(`🎬 Total tasks loaded: ${tasks.size}`);
});
