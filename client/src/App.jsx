import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Download, Plus, Upload, Image, Film, Sparkles,
  Clock, Trash2, X, ChevronRight, Layers, Wand2, Type,
  MonitorPlay, Scissors, Grid3X3, ListVideo, Settings,
  Maximize2, Volume2, VolumeX, RefreshCw, Zap, FileText,
  Camera, Move, Copy, ChevronDown, ChevronUp, Eye, EyeOff,
  Key, Save, Link2
} from 'lucide-react';
import './index.css';

const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';
const AGNES_API_URL = 'https://apihub.agnes-ai.com/agnesapi';

const VIDEO_MODEL = 'agnes-video-v2.0';
const IMAGE_MODEL = 'agnes-image-2.1-flash';

const FRAME_RATE = 24;

const DURATIONS = [
  { value: 3, label: '3秒', frames: 81 },
  { value: 5, label: '5秒', frames: 121 },
  { value: 10, label: '10秒', frames: 241 },
  { value: 18, label: '18秒', frames: 441 }
];

const RESOLUTIONS = [
  { value: '720p', label: '720p (1280×768)', width: 1280, height: 768 },
  { value: '480p', label: '480p (854×480)', width: 854, height: 480 },
  { value: '1080p', label: '1080p (1920×1080)', width: 1920, height: 1080 }
];

const STYLES = [
  { id: 'wuxia', name: '武侠意境', desc: '古典武侠雨夜庭院', gradient: 'from-amber-500 to-red-600', icon: '⚔️',
    imagePrompt: 'cinematic wuxia scene, ancient Chinese courtyard in rain, lone warrior in white robe standing on tiled roof, misty mountains in background, dramatic lighting, moody atmosphere, 8k, highly detailed',
    videoPrompt: 'rain falling gently, robe flowing in wind, mist drifting through courtyard, subtle camera push-in, cinematic, 24fps' },
  { id: 'cyberpunk-mecha', name: '赛博机甲', desc: '赛博朋克霓虹机甲', gradient: 'from-cyan-400 to-blue-600', icon: '🤖',
    imagePrompt: 'cyberpunk mech robot standing in neon-lit city street at night, rain reflections on wet pavement, holographic signs, purple and blue neon glow, detailed machinery, cinematic composition',
    videoPrompt: 'neon signs flickering, rain streaks, subtle mech head movement, steam rising from vents, slow camera orbit, cyberpunk aesthetic, 24fps' },
  { id: 'scifi-transformation', name: '科幻变身', desc: '未来科技机甲觉醒', gradient: 'from-blue-500 to-purple-600', icon: '✨',
    imagePrompt: 'sci-fi robotic armor awakening, glowing energy cores, futuristic laboratory, sleek metallic surfaces, blue and purple energy streams, dramatic backlighting, cinematic quality',
    videoPrompt: 'energy cores pulsing, armor panels shifting and locking into place, energy streams flowing, lens flare effects, slow dramatic camera movement, 24fps' },
  { id: 'cozy-pet', name: '治愈萌宠', desc: '温暖治愈人宠陪伴', gradient: 'from-yellow-400 to-orange-500', icon: '🐕',
    imagePrompt: 'cozy golden retriever puppy sleeping on soft blanket, warm afternoon sunlight streaming through window, dust motes in air, soft focus, heartwarming scene, photorealistic',
    videoPrompt: 'gentle breathing, tail twitching slightly, sunlight shifting, soft bokeh background, slow camera zoom, warm color grade, 24fps' },
  { id: 'weapon-energy', name: '能量武器', desc: '科幻能量武器充能', gradient: 'from-amber-400 to-red-500', icon: '⚡',
    imagePrompt: 'futuristic energy weapon powering up, glowing plasma core, sci-fi lab environment, orange and cyan energy discharges, lens flare, dramatic lighting, high detail',
    videoPrompt: 'energy building up in core, plasma arcs crackling around weapon, intensity increasing, lens flare pulsing, slow push-in camera, 24fps' },
  { id: 'ocean-sunset', name: '海边日落', desc: '绝美海边日落电影', gradient: 'from-orange-400 to-pink-500', icon: '🌅',
    imagePrompt: 'breathtaking ocean sunset, golden hour, waves gently rolling onto sandy beach, silhouette of lone figure walking, dramatic sky with orange and pink clouds, cinematic composition',
    videoPrompt: 'waves rolling in and out, clouds drifting slowly, sun dipping toward horizon, warm color shifting, subtle camera pan, cinematic, 24fps' },
  { id: 'fantasy-forest', name: '奇幻森林', desc: '魔法森林精灵光影', gradient: 'from-emerald-400 to-teal-500', icon: '🌲',
    imagePrompt: 'magical fantasy forest with glowing fireflies, ancient towering trees, ethereal green and gold light beams through canopy, mystical atmosphere, fairy tale aesthetic, highly detailed',
    videoPrompt: 'fireflies floating and glowing, light beams shifting, leaves gently falling, mystical particles drifting, slow camera glide forward, 24fps' },
  { id: 'anime-style', name: '动漫风格', desc: '日系动漫精美画风', gradient: 'from-pink-400 to-purple-500', icon: '🎨',
    imagePrompt: 'beautiful anime style illustration, young person with flowing hair standing on a school rooftop at sunset, dramatic sky with orange and pink clouds, wind blowing hair and uniform skirt, detailed artwork, Studio Ghibli inspired, vibrant colors, cinematic composition, high quality',
    videoPrompt: 'hair and clothing gently blowing in wind, clouds drifting across sunset sky, lens flare shifting subtly, cherry blossom petals floating by, slow subtle camera push-in, anime style, smooth animation, 24fps' }
];

const MODES = [
  { id: 'text-to-video', label: '文生视频', icon: Type, desc: '用文字描述直接生成视频' },
  { id: 'image-to-video', label: '图生视频', icon: Image, desc: '上传图片生成动态视频' },
  { id: 'multi-image', label: '多图视频', icon: Layers, desc: '多张图片合成视频' },
  { id: 'keyframes', label: '关键帧', icon: Scissors, desc: '关键帧之间生成过渡' },
  { id: 'style-preset', label: '风格预设', icon: Sparkles, desc: '一键生成电影级大片' }
];

const LEFT_TABS = [
  { id: 'assets', label: '素材库', icon: Layers },
  { id: 'styles', label: '风格库', icon: Wand2 },
  { id: 'tasks', label: '任务记录', icon: ListVideo }
];

const RIGHT_TABS = [
  { id: 'generate', label: '生成', icon: Zap },
  { id: 'settings', label: '设置', icon: Settings }
];

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('agnes_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeMode, setActiveMode] = useState('style-preset');
  const [leftTab, setLeftTab] = useState('styles');
  const [rightTab, setRightTab] = useState('generate');
  const [assets, setAssets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('assets') || '[]'); } catch (e) { return []; }
  });
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tasks') || '[]'); } catch (e) { return []; }
  });
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedKeyframes, setSelectedKeyframes] = useState([]);
  const [textPrompt, setTextPrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState('720p');
  const [seed, setSeed] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoLibrary, setShowVideoLibrary] = useState(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const pollingRef = useRef(null);
  const tasksRef = useRef([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agnes_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const hasProcessing = tasks.some(t => t.status === 'pending' || t.status === 'processing');
    if (hasProcessing && !pollingRef.current) {
      startPolling();
    }
    const hasActive = tasks.some(t => t.status === 'pending' || t.status === 'processing');
    if (!hasActive && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [tasks]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    console.log('📡 开始轮询任务状态...');
    pollingRef.current = setInterval(async () => {
      const currentTasks = tasksRef.current;
      const processingTasks = currentTasks.filter(t => 
        (t.status === 'pending' || t.status === 'processing') && (t.agnesTaskId || t.agnesVideoId)
      );
      
      if (processingTasks.length === 0) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log('📡 所有任务完成，停止轮询');
        return;
      }

      let hasUpdate = false;
      const updates = [];

      for (const task of processingTasks) {
        try {
          const status = await checkVideoStatus(task.agnesVideoId, task.agnesTaskId);
          console.log(`📊 任务 ${task.id} 原始返回:`, status);
          
          let newStatus = task.status;
          let newProgress = task.progress;
          let newStage = task.stage;
          let newVideoUrl = task.videoUrl;
          let newError = task.error;
          let rawStatus = '';
          
          rawStatus = status.status || status.state || '';
          
          const isCompleted = 
            status.status === 'completed' ||
            !!status.remixed_from_video_id ||
            !!status.video_url ||
            !!status.url;
          
          const isFailed = 
            status.status === 'failed' ||
            status.status === 'error' ||
            (status.error && status.error !== null);
          
          if (isCompleted) {
            newStatus = 'completed';
            newProgress = 100;
            newStage = 'completed';
            newVideoUrl = status.remixed_from_video_id 
              || status.video_url 
              || status.url;
            hasUpdate = true;
            console.log(`✅ 任务 ${task.id} 完成! 视频地址:`, newVideoUrl);
            showToast('🎬 视频生成完成！', 'success');
          } else if (isFailed) {
            newStatus = 'failed';
            newError = (status.error && typeof status.error === 'object' && status.error.message) 
              || (typeof status.error === 'string' ? status.error : null)
              || status.error_msg 
              || '生成失败';
            hasUpdate = true;
            console.log(`❌ 任务 ${task.id} 失败:`, newError);
          } else {
            const apiProgress = status.progress || 0;
            
            if (apiProgress && typeof apiProgress === 'number' && apiProgress > 0) {
              newProgress = Math.min(apiProgress, 99);
            } else {
              if (newProgress < 99) {
                newProgress = Math.min(newProgress + 0.3, 99);
              }
            }
            if (status.status === 'queued') {
              newStage = 'queued';
            } else if (status.status === 'in_progress') {
              newStage = 'generating_video';
            } else {
              newStage = 'generating_video';
            }
            hasUpdate = true;
          }
          
          updates.push({
            id: task.id,
            status: newStatus,
            progress: newProgress,
            stage: newStage,
            videoUrl: newVideoUrl,
            error: newError,
            rawStatus: rawStatus
          });
        } catch (e) {
          console.error(`轮询任务 ${task.id} 出错:`, e.message);
        }
      }

      if (hasUpdate && updates.length > 0) {
        setTasks(prev => prev.map(t => {
          const update = updates.find(u => u.id === t.id);
          if (update) {
            return { ...t, ...update };
          }
          return t;
        }));
      }
    }, 3000);
  };

  const callAgnesAPI = async (endpoint, options = {}) => {
    if (!apiKey) {
      throw new Error('请先在设置中填写 Agnes AI API Key');
    }
    
    const response = await fetch(`${AGNES_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `请求失败 (${response.status})`;
      let errorDetail = '';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error?.message || errorData.error || errorMsg;
        errorDetail = errorData.error?.details || '';
      } catch (e) {}
      
      const status = response.status;
      if (status === 401) {
        throw new Error('API Key 无效或已过期，请检查设置');
      } else if (status === 402) {
        throw new Error('账户余额或配额不足，请充值后再试');
      } else if (status === 403) {
        throw new Error('无权访问该模型，请检查账户权限');
      } else if (status === 404) {
        throw new Error('接口地址或模型名称不正确（404）');
      } else if (status === 400) {
        throw new Error('请求参数无效: ' + (errorDetail || errorMsg));
      } else if (status === 422) {
        throw new Error('参数不符合要求: ' + (errorDetail || errorMsg));
      } else if (status === 429) {
        throw new Error('请求过于频繁，请稍候再试（429）');
      } else if (status === 503) {
        throw new Error('Agnes AI 服务暂时不可用（503），请稍后再试');
      } else if (status === 502) {
        throw new Error('网关错误（502），请检查网络后重试');
      } else if (status === 504) {
        throw new Error('网关超时（504），请稍后再试');
      } else if (status === 500) {
        throw new Error('服务器内部错误（500），请稍后再试');
      } else if (status === 408) {
        throw new Error('请求超时（408），请检查网络后重试');
      }
      throw new Error(errorMsg);
    }
    
    return response.json();
  };

  const generateImage = async (prompt, size = '1024x768') => {
    const data = await callAgnesAPI('/images/generations', {
      method: 'POST',
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: prompt,
        size: size,
        extra_body: {
          response_format: 'url'
        }
      })
    });
    
    if (data.data && data.data.length > 0) {
      return data.data[0].url;
    }
    throw new Error('图片生成失败：无返回数据');
  };

  const submitVideoGeneration = async ({ prompt, imageUrl, imageUrls, mode, seconds, width, height, negativePrompt, seedNum }) => {
    const durConfig = DURATIONS.find(d => d.value === seconds) || DURATIONS[1];
    const resConfig = RESOLUTIONS.find(r => r.value === resolution) || RESOLUTIONS[0];
    
    const body = {
      model: VIDEO_MODEL,
      prompt: prompt,
      num_frames: durConfig.frames,
      frame_rate: FRAME_RATE,
      width: width || resConfig.width,
      height: height || resConfig.height
    };
    
    if (imageUrl && mode === 'image-to-video') {
      body.image = imageUrl;
    }
    
    if (imageUrls && imageUrls.length > 0 && (mode === 'multi-image' || mode === 'keyframes')) {
      if (!body.extra_body) body.extra_body = {};
      body.extra_body.image = imageUrls;
      if (mode === 'keyframes') {
        body.extra_body.mode = 'keyframes';
      }
    }
    
    if (negativePrompt) {
      body.negative_prompt = negativePrompt;
    }
    
    if (seedNum) {
      body.seed = seedNum;
    }
    
    const data = await callAgnesAPI('/videos', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    return {
      taskId: data.task_id || data.id,
      videoId: data.video_id
    };
  };

  const checkVideoStatus = async (videoId, taskId) => {
    if (videoId) {
      try {
        const response = await fetch(`${AGNES_API_URL}?video_id=${encodeURIComponent(videoId)}&model_name=${VIDEO_MODEL}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('video_id 查询失败，尝试 task_id:', e.message);
      }
    }
    if (taskId) {
      return await callAgnesAPI(`/videos/${taskId}`);
    }
    throw new Error('没有有效的任务ID');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAsset = {
          id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
          name: file.name,
          type: 'image',
          size: formatFileSize(file.size),
          dataUrl: e.target.result,
          createdAt: new Date().toISOString()
        };
        setAssets(prev => [newAsset, ...prev]);
        if (activeMode === 'image-to-video') {
          setSelectedAsset(newAsset);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (imageFiles.length > 0) {
      showToast(`已添加 ${imageFiles.length} 张图片`, 'success');
    }
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
    setSelectedKeyframes(prev => prev.filter(k => k.id !== id));
  };

  const toggleKeyframe = (asset) => {
    setSelectedKeyframes(prev => {
      const exists = prev.find(k => k.id === asset.id);
      if (exists) {
        return prev.filter(k => k.id !== asset.id);
      }
      if (prev.length >= 6) {
        showToast('最多选择6张关键帧', 'error');
        return prev;
      }
      return [...prev, asset];
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const generateVideo = async () => {
    if (!apiKey) {
      showToast('请先在设置中填写 API Key', 'error');
      setRightTab('settings');
      return;
    }
    
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const taskId = 'task_' + Math.random().toString(36).substring(2, 10);
      let videoPrompt = '';
      let styleName = '';
      let mode = activeMode;
      let imageUrl = null;
      let imageUrls = [];
      let firstImageUrl = null;

      const resConfig = RESOLUTIONS.find(r => r.value === resolution) || RESOLUTIONS[0];
      const sizeStr = `${resConfig.width}x${resConfig.height}`;

      if (activeMode === 'text-to-video') {
        if (!textPrompt.trim()) {
          showToast('请输入视频描述', 'error');
          setIsGenerating(false);
          return;
        }
        styleName = '文生视频';
        videoPrompt = textPrompt + ', cinematic, high quality, smooth motion';
        
      } else if (activeMode === 'image-to-video') {
        if (!selectedAsset) {
          showToast('请选择或上传一张图片', 'error');
          setIsGenerating(false);
          return;
        }
        styleName = '图生视频';
        imageUrl = selectedAsset.dataUrl;
        firstImageUrl = imageUrl;
        videoPrompt = motionPrompt || 'subtle natural movement, cinematic lighting, smooth motion';
        
      } else if (activeMode === 'multi-image' || activeMode === 'keyframes') {
        if (selectedKeyframes.length < 2) {
          showToast(`请至少选择2张图片`, 'error');
          setIsGenerating(false);
          return;
        }
        styleName = activeMode === 'keyframes' ? '关键帧动画' : '多图视频';
        imageUrls = selectedKeyframes.map(k => k.dataUrl);
        firstImageUrl = imageUrls[0];
        videoPrompt = textPrompt.trim() || (
          activeMode === 'keyframes'
            ? 'Smooth cinematic transition between keyframes, maintaining visual consistency, natural motion'
            : 'Create a smooth video sequence combining the reference images, cinematic quality, natural transitions'
        );
        
      } else {
        if (!selectedStyle) {
          showToast('请选择一个风格', 'error');
          setIsGenerating(false);
          return;
        }
        styleName = selectedStyle.name;
        const customPrompt = textPrompt.trim();
        const imgPrompt = customPrompt ? customPrompt + ', ' + selectedStyle.imagePrompt : selectedStyle.imagePrompt;
        videoPrompt = selectedStyle.videoPrompt;
        
        try {
          showToast('正在生成参考图...', 'info');
          imageUrl = await generateImage(imgPrompt, sizeStr);
          firstImageUrl = imageUrl;
        } catch (err) {
          showToast('参考图生成失败: ' + err.message, 'error');
          setIsGenerating(false);
          return;
        }
      }

      const newTask = {
        id: taskId,
        style: activeMode,
        styleName: styleName,
        mode: mode,
        status: 'processing',
        progress: 5,
        stage: 'submitting',
        imagePrompt: textPrompt,
        videoPrompt: videoPrompt,
        duration: duration,
        imageUrl: firstImageUrl,
        videoUrl: null,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('正在提交视频生成任务...', 'info');

      const seedNum = seed ? parseInt(seed) : null;
      
      const result = await submitVideoGeneration({
        prompt: videoPrompt,
        imageUrl: imageUrl,
        imageUrls: imageUrls,
        mode: mode,
        seconds: duration,
        width: resConfig.width,
        height: resConfig.height,
        negativePrompt: negativePrompt,
        seedNum: seedNum
      });

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { 
            ...t, 
            agnesTaskId: result.taskId,
            agnesVideoId: result.videoId,
            status: 'processing', 
            progress: 10, 
            stage: 'queued' 
          };
        }
        return t;
      }));
      
      showToast('视频生成中，请稍候...', 'success');
      setShowVideoLibrary(true);
      
    } catch (error) {
      console.error('生成失败:', error);
      showToast(error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const playVideo = (video) => {
    setPreviewVideo(video);
    setIsPlaying(true);
  };

  const closePreview = () => {
    setPreviewVideo(null);
    setIsPlaying(false);
  };

  const getStatusLabel = (status, stage) => {
    if (status === 'completed') return '已完成';
    if (status === 'failed') return '失败';
    if (stage === 'queued' || status === 'pending') return '排队中';
    if (stage === 'submitting') return '提交中';
    if (stage === 'generating_video' || status === 'processing') return '生成视频中';
    return '处理中';
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const processingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl backdrop-blur-xl ${
              toast.type === 'error' ? 'bg-red-500/90 text-white' :
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
              'bg-white/10 text-white border border-white/10'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-14 border-b border-white/5 bg-[#0d1220]/80 backdrop-blur-xl flex items-center justify-between px-4 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              LibTV Studio
            </h1>
            <p className="text-[10px] text-white/40">空间化 AI 视频创作平台</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 backdrop-blur">
          {MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => { setActiveMode(mode.id); setSelectedStyle(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeMode === mode.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVideoLibrary(!showVideoLibrary)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showVideoLibrary
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            作品库
            {completedTasks.length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-purple-500 text-[10px] flex items-center justify-center text-white">
                {completedTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={generateVideo}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {isGenerating ? '生成中...' : '生成视频'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: leftCollapsed ? 48 : 260 }}
          className="border-r border-white/5 bg-[#0d1220]/50 flex flex-col flex-shrink-0"
        >
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-2 flex-shrink-0">
            {!leftCollapsed && (
              <div className="flex items-center gap-0.5">
                {LEFT_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setLeftTab(tab.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        leftTab === tab.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${leftCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {!leftCollapsed && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {leftTab === 'assets' && (
                <div className="p-3">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 mb-3 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-white/30" />
                    <p className="text-xs text-white/50">拖拽或点击上传</p>
                    <p className="text-[10px] text-white/30 mt-0.5">支持 JPG/PNG/WebP/GIF</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {assets.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-white/40 px-1">素材 ({assets.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {assets.map(asset => (
                          <div
                            key={asset.id}
                            onClick={() => {
                              if (activeMode === 'multi-image' || activeMode === 'keyframes') {
                                toggleKeyframe(asset);
                              } else if (asset.type === 'image') {
                                setSelectedAsset(asset);
                              }
                            }}
                            className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                              (activeMode === 'multi-image' || activeMode === 'keyframes')
                                ? selectedKeyframes.find(k => k.id === asset.id)
                                  ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1220]'
                                  : 'hover:ring-1 hover:ring-white/30'
                                : selectedAsset?.id === asset.id
                                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1220]'
                                : 'hover:ring-1 hover:ring-white/30'
                            }`}
                          >
                            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                            {(activeMode === 'multi-image' || activeMode === 'keyframes') && selectedKeyframes.find(k => k.id === asset.id) && (
                              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-[10px] font-bold text-[#0a0e1a]">
                                {selectedKeyframes.findIndex(k => k.id === asset.id) + 1}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                                className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                              <p className="text-[9px] text-white/80 truncate">{asset.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assets.length === 0 && (
                    <div className="text-center py-8">
                      <Image className="w-10 h-10 mx-auto mb-2 text-white/10" />
                      <p className="text-xs text-white/30">暂无素材</p>
                      <p className="text-[10px] text-white/20 mt-1">上传图片用于图生视频</p>
                    </div>
                  )}
                </div>
              )}

              {leftTab === 'styles' && (
                <div className="p-3">
                  <p className="text-[11px] text-white/40 px-1 mb-2">风格预设</p>
                  <div className="space-y-2">
                    {STYLES.map(style => (
                      <div
                        key={style.id}
                        onClick={() => { setSelectedStyle(style); if (activeMode !== 'style-preset') setActiveMode('style-preset'); }}
                        className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                          selectedStyle?.id === style.id
                            ? 'ring-2 ring-cyan-400 scale-[1.02]'
                            : 'hover:ring-1 hover:ring-white/20'
                        }`}
                      >
                        <div className={`h-16 bg-gradient-to-r ${style.gradient} relative`}>
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <div>
                              <p className="text-sm font-bold text-white">{style.name}</p>
                              <p className="text-[10px] text-white/70">{style.desc}</p>
                            </div>
                            <span className="text-2xl">{style.icon}</span>
                          </div>
                        </div>
                        {selectedStyle?.id === style.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                            <ChevronRight className="w-3 h-3 text-[#0a0e1a]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leftTab === 'tasks' && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] text-white/40 px-1">任务记录</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-white/30">{tasks.length} 个</span>
                      <button
                        onClick={() => {
                          if (processingTasks.length > 0) {
                            showToast('正在刷新状态...', 'info');
                          }
                        }}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-colors"
                        title="刷新状态"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ListVideo className="w-10 h-10 mx-auto mb-2 text-white/10" />
                      <p className="text-xs text-white/30">暂无任务</p>
                      <p className="text-[10px] text-white/20 mt-1">生成的视频会保存在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => task.status === 'completed' && playVideo(task)}
                          className={`p-2.5 rounded-lg border transition-all ${
                            task.status === 'completed'
                              ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer'
                              : task.status === 'failed'
                              ? 'border-red-500/20 bg-red-500/[0.05]'
                              : 'border-cyan-500/20 bg-cyan-500/[0.05]'
                          }`}
                        >
                          <div className="flex gap-2">
                            <div className="w-16 h-10 rounded bg-black/30 flex-shrink-0 overflow-hidden">
                              {task.imageUrl ? (
                                <img src={task.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-4 h-4 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium text-white/80 truncate">{task.styleName}</p>
                                {(task.status === 'pending' || task.status === 'processing') && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const status = await checkVideoStatus(task.agnesVideoId, task.agnesTaskId);
                                        console.log(`🔍 手动刷新任务 ${task.id}:`, status);
                                        showToast('已刷新，查看控制台', 'info');
                                      } catch (err) {
                                        showToast('刷新失败: ' + err.message, 'error');
                                      }
                                    }}
                                    className="p-0.5 rounded hover:bg-white/20 text-white/40 hover:text-cyan-400 transition-colors flex-shrink-0"
                                    title="手动刷新状态"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {getStatusLabel(task.status, task.stage)} · {task.duration}s
                              </p>
                              {task.rawStatus && (task.status === 'pending' || task.status === 'processing') && (
                                <p className="text-[9px] text-cyan-400/60 mt-0.5 font-mono">
                                  API状态: {task.rawStatus}
                                </p>
                              )}
                              {(task.status === 'pending' || task.status === 'processing') && (
                                <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              )}
                              {task.status === 'failed' && (
                                <p className="text-[10px] text-red-400 mt-0.5 truncate">{task.error}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">
                {activeMode === 'text-to-video' && '文生视频'}
                {activeMode === 'image-to-video' && '图生视频'}
                {activeMode === 'style-preset' && (selectedStyle ? selectedStyle.name : '选择风格')}
              </span>
              {processingTasks.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {processingTasks.length} 个任务进行中
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/30">
                {(() => {
                  const r = RESOLUTIONS.find(x => x.value === resolution);
                  return r ? `${r.width} × ${r.height}` : resolution;
                })()}
              </span>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 relative overflow-hidden transition-all ${
              isDragging ? 'bg-cyan-500/5' : ''
            }`}
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                {activeMode === 'image-to-video' && selectedAsset ? (
                  <>
                    <img src={selectedAsset.dataUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs text-white/70">{selectedAsset.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">点击右侧「生成」按钮创建视频</p>
                    </div>
                  </>
                ) : (activeMode === 'multi-image' || activeMode === 'keyframes') && selectedKeyframes.length > 0 ? (
                  <div className="w-full h-full bg-[#0f1420] flex items-center justify-center p-4">
                    <div className="flex items-end gap-2 h-full">
                      {selectedKeyframes.map((kf, idx) => (
                        <div key={kf.id} className="flex flex-col items-center gap-1 flex-1 h-full justify-center">
                          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-white/10">
                            <img src={kf.dataUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-400 text-[10px] font-bold text-[#0a0e1a] flex items-center justify-center">
                              {idx + 1}
                            </div>
                          </div>
                          {idx < selectedKeyframes.length - 1 && (
                            <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2">
                              <ChevronRight className="w-4 h-4 text-cyan-400/50" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs text-white/70">
                        {activeMode === 'keyframes' ? `${selectedKeyframes.length} 个关键帧` : `${selectedKeyframes.length} 张参考图`}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">点击右侧「生成」创建视频</p>
                    </div>
                  </div>
                ) : activeMode === 'style-preset' && selectedStyle ? (
                  <>
                    <div className={`w-full h-full bg-gradient-to-br ${selectedStyle.gradient} flex items-center justify-center`}>
                      <span className="text-8xl">{selectedStyle.icon}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-2xl font-bold text-white mb-1">{selectedStyle.name}</p>
                      <p className="text-sm text-white/70">{selectedStyle.desc}</p>
                    </div>
                  </>
                ) : activeMode === 'text-to-video' && textPrompt ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1d2e] via-[#16192a] to-[#0f1220] flex flex-col items-center justify-center p-8">
                    <Type className="w-12 h-12 text-cyan-400/50 mb-4" />
                    <p className="text-center text-white/70 max-w-md leading-relaxed">{textPrompt}</p>
                    <p className="text-xs text-white/30 mt-4">{duration} 秒 · 1024×576</p>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (activeMode === 'image-to-video') {
                        fileInputRef.current?.click();
                      } else if (activeMode === 'style-preset') {
                        setLeftTab('styles');
                      }
                    }}
                    className="w-full h-full bg-[#0f1420] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <MonitorPlay className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-sm text-white/40 mb-1">
                      {activeMode === 'text-to-video' ? '在右侧输入视频描述' :
                       activeMode === 'image-to-video' ? '拖拽图片到此处或点击上传' :
                       activeMode === 'multi-image' || activeMode === 'keyframes' ? '从左侧素材库选择多张图片' :
                       '从左侧选择一个风格开始创作'}
                    </p>
                    <p className="text-xs text-white/20">
                      {activeMode === 'text-to-video' ? '支持中英文描述，越详细效果越好' :
                       activeMode === 'image-to-video' ? '支持 JPG, PNG, WebP, GIF 格式' :
                       activeMode === 'multi-image' || activeMode === 'keyframes' ? '点击素材库中的图片进行选择，至少2张' :
                       '8种电影级风格预设，一键生成大片'}
                    </p>
                  </div>
                )}

                {isDragging && (
                  <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-400 rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-cyan-400" />
                      <p className="text-cyan-300 font-medium">释放以添加素材</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showVideoLibrary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5 bg-[#0d1220]/80 backdrop-blur-xl flex-shrink-0 overflow-hidden"
              >
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-white/70">我的作品</span>
                    <span className="text-[10px] text-white/30">({tasks.length})</span>
                  </div>
                  <button
                    onClick={() => setShowVideoLibrary(false)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-6">
                      <Film className="w-8 h-8 mx-auto mb-2 text-white/10" />
                      <p className="text-xs text-white/30">暂无视频作品</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => task.status === 'completed' && playVideo(task)}
                          className={`flex-shrink-0 w-44 rounded-xl overflow-hidden border border-white/5 transition-all ${
                            task.status === 'completed' ? 'cursor-pointer hover:scale-[1.02] hover:border-white/20' : ''
                          }`}
                        >
                          <div className="relative aspect-video bg-black/30">
                            {task.imageUrl ? (
                              <img src={task.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                            {task.status === 'completed' && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-[#0a0e1a] ml-0.5" />
                                </div>
                              </div>
                            )}
                            {(task.status === 'pending' || task.status === 'processing') && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                                <p className="text-xs text-white/70">{task.progress}%</p>
                              </div>
                            )}
                            {task.status === 'failed' && (
                              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                                <p className="text-xs text-red-300 px-2 text-center">生成失败</p>
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white/[0.02]">
                            <p className="text-[11px] text-white/70 truncate">{task.styleName}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-white/30">{task.duration}s</span>
                              {task.status === 'completed' && (
                                <a
                                  href={task.videoUrl}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                                >
                                  <Download className="w-3 h-3" />
                                  下载
                                </a>
                              )}
                            </div>
                            {task.status !== 'completed' && task.status !== 'failed' && (
                              <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={false}
          animate={{ width: rightCollapsed ? 48 : 300 }}
          className="border-l border-white/5 bg-[#0d1220]/50 flex flex-col flex-shrink-0"
        >
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-2 flex-shrink-0">
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${rightCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {!rightCollapsed && (
              <div className="flex items-center gap-0.5">
                {RIGHT_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        rightTab === tab.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!rightCollapsed && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
              {rightTab === 'settings' && (
                <>
                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      Agnes AI API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="输入你的 API Key"
                        className="w-full px-3 py-2 pr-20 rounded-lg bg-white/[0.03] border border-white/10 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1.5">
                      API Key 保存在浏览器本地，不会上传到任何服务器
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[11px] text-white/60 font-medium mb-1.5">获取 API Key</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        访问 Agnes AI 官网注册账号，在控制台中获取你的 API Key。
                      </p>
                      <a
                        href="https://apihub.agnes-ai.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" />
                        前往 Agnes AI 官网
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">输出设置</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-white/60">视频模型</span>
                        <span className="text-xs text-cyan-400">{VIDEO_MODEL}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-white/60">图像模型</span>
                        <span className="text-xs text-purple-400">{IMAGE_MODEL}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-white/60">帧率</span>
                        <span className="text-xs text-white/40">{FRAME_RATE} fps</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (confirm('确定要清除所有本地数据吗？')) {
                          localStorage.clear();
                          setApiKey('');
                          setAssets([]);
                          setTasks([]);
                          showToast('已清除所有本地数据', 'success');
                        }
                      }}
                      className="w-full py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清除所有本地数据
                    </button>
                  </div>
                </>
              )}

              {rightTab === 'generate' && (
                <>
                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">生成模式</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MODES.slice(0, 3).map(mode => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => { setActiveMode(mode.id); setSelectedStyle(null); setSelectedKeyframes([]); }}
                            className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                              activeMode === mode.id
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px]">{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {MODES.slice(3).map(mode => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => { setActiveMode(mode.id); setSelectedStyle(null); setSelectedKeyframes([]); }}
                            className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                              activeMode === mode.id
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px]">{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {activeMode === 'text-to-video' && (
                    <div>
                      <label className="text-[11px] text-white/50 mb-2 block font-medium">视频描述</label>
                      <textarea
                        value={textPrompt}
                        onChange={e => setTextPrompt(e.target.value)}
                        placeholder="描述你想要的视频内容，越详细效果越好..."
                        className="w-full h-28 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                      />
                      <p className="text-[10px] text-white/30 mt-1.5">{textPrompt.length} 字符</p>
                    </div>
                  )}

                  {activeMode === 'image-to-video' && (
                    <>
                      <div>
                        <label className="text-[11px] text-white/50 mb-2 block font-medium">参考图片</label>
                        {selectedAsset ? (
                          <div className="relative rounded-lg overflow-hidden border border-white/10">
                            <img src={selectedAsset.dataUrl} alt="" className="w-full aspect-video object-cover" />
                            <button
                              onClick={() => setSelectedAsset(null)}
                              className="absolute top-2 right-2 p-1 rounded bg-black/60 hover:bg-black/80 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setLeftTab('assets'); }}
                            className="aspect-video rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                          >
                            <Image className="w-8 h-8 text-white/20 mb-2" />
                            <p className="text-xs text-white/40">从素材库选择图片</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[11px] text-white/50 mb-2 block font-medium">运动描述（可选）</label>
                        <textarea
                          value={motionPrompt}
                          onChange={e => setMotionPrompt(e.target.value)}
                          placeholder="描述画面中的运动和变化..."
                          className="w-full h-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {(activeMode === 'multi-image' || activeMode === 'keyframes') && (
                    <>
                      <div>
                        <label className="text-[11px] text-white/50 mb-2 block font-medium">
                          {activeMode === 'keyframes' ? '关键帧图片' : '参考图片'}
                          <span className="text-white/30 ml-2">
                            已选 {selectedKeyframes.length}/6 张
                          </span>
                        </label>
                        {selectedKeyframes.length > 0 ? (
                          <div className="grid grid-cols-3 gap-1.5 mb-2">
                            {selectedKeyframes.map((kf, idx) => (
                              <div key={kf.id} className="relative aspect-square rounded-md overflow-hidden border border-white/10">
                                <img src={kf.dataUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-cyan-400 text-[10px] font-bold text-[#0a0e1a] flex items-center justify-center">
                                  {idx + 1}
                                </div>
                                <button
                                  onClick={() => toggleKeyframe(kf)}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div
                          onClick={() => { setLeftTab('assets'); }}
                          className="aspect-[4/1] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                        >
                          <Layers className="w-6 h-6 text-white/20 mb-1" />
                          <p className="text-[11px] text-white/40">从左侧素材库点击选择图片</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-white/50 mb-2 block font-medium">
                          {activeMode === 'keyframes' ? '过渡描述（可选）' : '视频描述（可选）'}
                        </label>
                        <textarea
                          value={textPrompt}
                          onChange={e => setTextPrompt(e.target.value)}
                          placeholder={activeMode === 'keyframes' 
                            ? '描述关键帧之间的过渡效果和运动方式...'
                            : '描述视频内容和场景转换...'
                          }
                          className="w-full h-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {activeMode === 'style-preset' && (
                    <div>
                      <label className="text-[11px] text-white/50 mb-2 block font-medium">当前风格</label>
                      {selectedStyle ? (
                        <div className={`rounded-lg overflow-hidden border border-white/10 bg-gradient-to-r ${selectedStyle.gradient}`}>
                          <div className="p-3 bg-black/30">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-white">{selectedStyle.name}</p>
                                <p className="text-[10px] text-white/70">{selectedStyle.desc}</p>
                              </div>
                              <span className="text-2xl">{selectedStyle.icon}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setLeftTab('styles')}
                          className="h-16 rounded-lg border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                        >
                          <p className="text-xs text-white/40">点击从左侧选择风格</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <label className="text-[11px] text-white/50 mb-2 block font-medium">自定义描述（可选）</label>
                        <textarea
                          value={textPrompt}
                          onChange={e => setTextPrompt(e.target.value)}
                          placeholder="留空使用风格默认提示词..."
                          className="w-full h-16 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">视频时长</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {DURATIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${
                            duration === d.value
                              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-white/[0.03] text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">分辨率</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {RESOLUTIONS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => setResolution(r.value)}
                          className={`py-2 rounded-lg text-[10px] font-medium transition-all ${
                            resolution === r.value
                              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-white/[0.03] text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
                          }`}
                        >
                          {r.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium flex items-center justify-between">
                      <span>高级设置</span>
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">反向提示词（可选）</label>
                        <input
                          type="text"
                          value={negativePrompt}
                          onChange={e => setNegativePrompt(e.target.value)}
                          placeholder="避免出现的内容..."
                          className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-white/70 text-[11px] placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">随机种子（可选）</label>
                        <input
                          type="text"
                          value={seed}
                          onChange={e => setSeed(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="留空随机生成"
                          className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-white/70 text-[11px] placeholder-white/20 focus:outline-none focus:border-cyan-500/50 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={generateVideo}
                      disabled={isGenerating}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          开始生成
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-white/30 mt-2">
                      预计等待 1-3 分钟
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <video
                  ref={videoRef}
                  src={previewVideo.videoUrl}
                  poster={previewVideo.imageUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) { videoRef.current.pause(); }
                            else { videoRef.current.play(); }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-white">{previewVideo.styleName}</p>
                        <p className="text-xs text-white/50">{previewVideo.duration}秒</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={previewVideo.videoUrl}
                        download
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium transition-all shadow-lg shadow-cyan-500/25"
                      >
                        <Download className="w-4 h-4" />
                        下载视频
                      </a>
                      <button
                        onClick={closePreview}
                        className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
