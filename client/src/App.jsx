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

const DURATIONS = [
  { value: 3, label: '3秒' },
  { value: 5, label: '5秒' },
  { value: 8, label: '8秒' },
  { value: 10, label: '10秒' }
];

const MODES = [
  { id: 'text-to-video', label: '文生视频', icon: Type, desc: '用文字描述直接生成视频' },
  { id: 'image-to-video', label: '图生视频', icon: Image, desc: '上传图片生成动态视频' },
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
  const [textPrompt, setTextPrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [duration, setDuration] = useState(5);
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
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [tasks]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      let updated = false;
      const newTasks = [...tasks];
      
      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i];
        if (task.status !== 'pending' && task.status !== 'processing') continue;
        if (!task.agnesTaskId) continue;
        
        try {
          const status = await checkVideoStatus(task.agnesTaskId);
          task.progress = status.progress || task.progress;
          task.stage = task.status === 'pending' ? 'queued' : 'generating_video';
          
          if (status.status === 'completed') {
            task.status = 'completed';
            task.progress = 100;
            task.stage = 'completed';
            task.videoUrl = status.video_url || status.output?.video_url || status.result_url;
            task.completedAt = new Date().toISOString();
            updated = true;
          } else if (status.status === 'failed') {
            task.status = 'failed';
            task.error = status.error || '生成失败';
            updated = true;
          } else {
            updated = true;
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }
      
      if (updated) {
        setTasks([...newTasks]);
      }
    }, 10000);
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
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error?.message || errorData.error || errorMsg;
      } catch (e) {}
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key 无效或已过期，请检查设置');
      } else if (response.status === 503) {
        throw new Error('Agnes AI 服务暂时不可用（503），请稍后再试');
      } else if (response.status === 429) {
        throw new Error('请求过于频繁，请稍候再试');
      }
      throw new Error(errorMsg);
    }
    
    return response.json();
  };

  const generateImage = async (prompt, size = '1024x576') => {
    const data = await callAgnesAPI('/images/generations', {
      method: 'POST',
      body: JSON.stringify({
        model: 'agnes-image-2.1-flash',
        prompt: prompt,
        size: size
      })
    });
    
    if (data.data && data.data.length > 0) {
      return data.data[0].url;
    }
    throw new Error('图片生成失败：无返回数据');
  };

  const submitVideoGeneration = async (prompt, imageUrl, seconds = 5) => {
    const data = await callAgnesAPI('/video/generations', {
      method: 'POST',
      body: JSON.stringify({
        model: 'agnes-video-v2.0',
        prompt: prompt,
        seconds: String(seconds),
        input_image: imageUrl
      })
    });
    
    return data.id;
  };

  const checkVideoStatus = async (taskId) => {
    return await callAgnesAPI(`/videos/${taskId}`);
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
      let imageUrl = '';
      let videoPrompt = '';
      let styleName = '';
      let mode = activeMode;

      if (activeMode === 'text-to-video') {
        if (!textPrompt.trim()) {
          showToast('请输入视频描述', 'error');
          setIsGenerating(false);
          return;
        }
        styleName = '文生视频';
        videoPrompt = textPrompt + ', cinematic, photorealistic, 24fps, smooth motion';
        
        const newTask = {
          id: taskId,
          style: 'text-to-video',
          styleName: styleName,
          mode: mode,
          status: 'pending',
          progress: 0,
          stage: 'queued',
          imagePrompt: textPrompt,
          videoPrompt: videoPrompt,
          duration: duration,
          imageUrl: null,
          videoUrl: null,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
        showToast('任务已提交，正在生成参考图...', 'info');
        
        try {
          imageUrl = await generateImage(textPrompt);
          newTask.imageUrl = imageUrl;
          newTask.status = 'processing';
          newTask.progress = 30;
          newTask.stage = 'image_completed';
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t));
        } catch (err) {
          newTask.status = 'failed';
          newTask.error = err.message;
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t));
          showToast(err.message, 'error');
          setIsGenerating(false);
          return;
        }
        
      } else if (activeMode === 'image-to-video') {
        if (!selectedAsset) {
          showToast('请选择或上传一张图片', 'error');
          setIsGenerating(false);
          return;
        }
        styleName = '图生视频';
        imageUrl = selectedAsset.dataUrl;
        videoPrompt = motionPrompt || 'subtle natural movement, cinematic, photorealistic, 24fps';
        
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
        imageUrl = '';
        
        const newTask = {
          id: taskId,
          style: selectedStyle.id,
          styleName: styleName,
          mode: mode,
          status: 'pending',
          progress: 0,
          stage: 'queued',
          imagePrompt: imgPrompt,
          videoPrompt: videoPrompt,
          duration: duration,
          imageUrl: null,
          videoUrl: null,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
        showToast('任务已提交，正在生成参考图...', 'info');
        
        try {
          imageUrl = await generateImage(imgPrompt);
          newTask.imageUrl = imageUrl;
          newTask.status = 'processing';
          newTask.progress = 30;
          newTask.stage = 'image_completed';
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t));
        } catch (err) {
          newTask.status = 'failed';
          newTask.error = err.message;
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t));
          showToast(err.message, 'error');
          setIsGenerating(false);
          return;
        }
      }

      if (activeMode === 'image-to-video') {
        const newTask = {
          id: taskId,
          style: 'image-to-video',
          styleName: styleName,
          mode: mode,
          status: 'pending',
          progress: 0,
          stage: 'queued',
          imagePrompt: '',
          videoPrompt: videoPrompt,
          duration: duration,
          imageUrl: imageUrl,
          videoUrl: null,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
      }

      showToast('正在提交视频生成任务...', 'info');
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'processing', progress: 35, stage: 'generating_video' };
        }
        return t;
      }));
      
      const agnesTaskId = await submitVideoGeneration(videoPrompt, imageUrl, duration);
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, agnesTaskId, status: 'processing', progress: 40, stage: 'generating_video' };
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
    if (status === 'pending') return '排队中';
    if (stage === 'generating_image' || stage === 'queued') return '生成参考图';
    if (stage === 'image_completed') return '图片已完成';
    if (stage === 'generating_video') return '生成视频中';
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
                              if (asset.type === 'image') setSelectedAsset(asset);
                            }}
                            className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedAsset?.id === asset.id
                                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1220]'
                                : 'hover:ring-1 hover:ring-white/30'
                            }`}
                          >
                            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
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
                    <span className="text-[10px] text-white/30">{tasks.length} 个</span>
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
                              <p className="text-[11px] font-medium text-white/80 truncate">{task.styleName}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {getStatusLabel(task.status, task.stage)} · {task.duration}s
                              </p>
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
              <span className="text-[10px] text-white/30">1024 × 576</span>
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
                       '从左侧选择一个风格开始创作'}
                    </p>
                    <p className="text-xs text-white/20">
                      {activeMode === 'text-to-video' ? '支持中英文描述，越详细效果越好' :
                       activeMode === 'image-to-video' ? '支持 JPG, PNG, WebP, GIF 格式' :
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
                        <span className="text-xs text-white/60">分辨率</span>
                        <span className="text-xs text-white/40">1024 × 576</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-white/60">帧率</span>
                        <span className="text-xs text-white/40">24 fps</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-white/60">模型</span>
                        <span className="text-xs text-cyan-400">Agnes Video v2.0</span>
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
                      {MODES.map(mode => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => { setActiveMode(mode.id); setSelectedStyle(null); }}
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
