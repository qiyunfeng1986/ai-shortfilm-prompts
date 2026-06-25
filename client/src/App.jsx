import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Download, Plus, Upload, Image, Film, Sparkles,
  Clock, Trash2, X, ChevronRight, Layers, Wand2, Type,
  MonitorPlay, Scissors, Grid3X3, ListVideo, Settings,
  Maximize2, Volume2, VolumeX, RefreshCw, Zap, FileText,
  Camera, Move, Copy, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import './index.css';

const API_BASE = '/api';

const STYLES = [
  { id: 'wuxia', name: '武侠意境', desc: '古典武侠雨夜庭院', gradient: 'from-amber-500 to-red-600', icon: '⚔️' },
  { id: 'cyberpunk-mecha', name: '赛博机甲', desc: '赛博朋克霓虹机甲', gradient: 'from-cyan-400 to-blue-600', icon: '🤖' },
  { id: 'scifi-transformation', name: '科幻变身', desc: '未来科技机甲觉醒', gradient: 'from-blue-500 to-purple-600', icon: '✨' },
  { id: 'cozy-pet', name: '治愈萌宠', desc: '温暖治愈人宠陪伴', gradient: 'from-yellow-400 to-orange-500', icon: '🐕' },
  { id: 'weapon-energy', name: '能量武器', desc: '科幻能量武器充能', gradient: 'from-amber-400 to-red-500', icon: '⚡' },
  { id: 'ocean-sunset', name: '海边日落', desc: '绝美海边日落电影', gradient: 'from-orange-400 to-pink-500', icon: '🌅' },
  { id: 'fantasy-forest', name: '奇幻森林', desc: '魔法森林精灵光影', gradient: 'from-emerald-400 to-teal-500', icon: '🌲' },
  { id: 'anime-style', name: '动漫风格', desc: '日系动漫精美画风', gradient: 'from-pink-400 to-purple-500', icon: '🎨' }
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
  { id: 'scripts', label: '分镜脚本', icon: FileText }
];

const RIGHT_TABS = [
  { id: 'properties', label: '属性', icon: Settings },
  { id: 'generate', label: '生成', icon: Zap }
];

function App() {
  const [activeMode, setActiveMode] = useState('style-preset');
  const [leftTab, setLeftTab] = useState('styles');
  const [rightTab, setRightTab] = useState('generate');
  const [videos, setVideos] = useState([]);
  const [assets, setAssets] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadVideos();
    loadAssets();
    loadScripts();
  }, []);

  useEffect(() => {
    const hasProcessing = videos.some(v => v.status === 'pending' || v.status === 'processing');
    if (hasProcessing && !pollingRef.current) {
      startPolling();
    } else if (!hasProcessing && pollingRef.current) {
      stopPolling();
    }
    return () => stopPolling();
  }, [videos]);

  const loadVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (e) { console.error('加载视频失败:', e); }
  };

  const loadAssets = async () => {
    try {
      const res = await fetch(`${API_BASE}/assets`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (e) { console.error('加载素材失败:', e); }
  };

  const loadScripts = async () => {
    try {
      const res = await fetch(`${API_BASE}/scripts`);
      const data = await res.json();
      setScripts(data.scripts || []);
    } catch (e) { console.error('加载脚本失败:', e); }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      loadVideos();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
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
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await fetch(`${API_BASE}/assets/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.assets) {
        setAssets(prev => [...data.assets, ...prev]);
        if (data.assets.length > 0 && activeMode === 'image-to-video') {
          setSelectedAsset(data.assets[0]);
        }
      }
    } catch (e) { console.error('上传失败:', e); }
  };

  const deleteAsset = async (filename) => {
    try {
      await fetch(`${API_BASE}/assets/${filename}`, { method: 'DELETE' });
      setAssets(prev => prev.filter(a => a.filename !== filename));
      if (selectedAsset?.filename === filename) setSelectedAsset(null);
    } catch (e) { console.error('删除失败:', e); }
  };

  const generateVideo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      let endpoint, body;

      if (activeMode === 'text-to-video') {
        if (!textPrompt.trim()) { alert('请输入视频描述'); setIsGenerating(false); return; }
        endpoint = `${API_BASE}/videos/text-to-video`;
        body = { prompt: textPrompt, seconds: duration, resolution: '1024x576' };
      } else if (activeMode === 'image-to-video') {
        if (!selectedAsset) { alert('请选择或上传一张图片'); setIsGenerating(false); return; }
        const imageUrl = window.location.origin + selectedAsset.url;
        endpoint = `${API_BASE}/videos/image-to-video`;
        body = { imageUrl, motionPrompt: motionPrompt || 'subtle natural movement, cinematic, photorealistic, 24fps', seconds: duration };
      } else {
        if (!selectedStyle) { alert('请选择一个风格'); setIsGenerating(false); return; }
        endpoint = `${API_BASE}/videos/generate`;
        body = { styleId: selectedStyle.id, seconds: duration, customPrompt: textPrompt || undefined };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.id) {
        await loadVideos();
        setShowVideoLibrary(true);
      }
    } catch (e) {
      console.error('生成失败:', e);
      alert('生成失败: ' + e.message);
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
    if (stage === 'generating_image') return '生成参考图';
    if (stage === 'image_completed') return '图片已完成';
    if (stage === 'generating_video') return '生成视频中';
    if (stage === 'downloading') return '下载中';
    return '处理中';
  };

  const completedVideos = videos.filter(v => v.status === 'completed');
  const processingVideos = videos.filter(v => v.status === 'pending' || v.status === 'processing');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
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
            视频库
            {completedVideos.length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-purple-500 text-[10px] flex items-center justify-center text-white">
                {completedVideos.length}
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
        {/* 左侧面板 */}
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
                    <p className="text-[10px] text-white/30 mt-0.5">支持 JPG/PNG/GIF/MP4</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
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
                            {asset.type === 'image' ? (
                              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <Film className="w-6 h-6 text-white/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteAsset(asset.filename); }}
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

              {leftTab === 'scripts' && (
                <div className="p-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/scripts`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: '新脚本 ' + (scripts.length + 1) })
                        });
                        const data = await res.json();
                        if (data.script) setScripts(prev => [data.script, ...prev]);
                      } catch (e) {}
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 mb-3 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建分镜脚本
                  </button>

                  {scripts.length > 0 ? (
                    <div className="space-y-2">
                      {scripts.map(script => (
                        <div
                          key={script.id}
                          className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer border border-white/5 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{script.title}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">{script.shots?.length || 0} 个镜头</p>
                            </div>
                            <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-white/10" />
                      <p className="text-xs text-white/30">暂无脚本</p>
                      <p className="text-[10px] text-white/20 mt-1">创建分镜脚本，规划每个镜头</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* 中间主画布区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">
                {activeMode === 'text-to-video' && '文生视频'}
                {activeMode === 'image-to-video' && '图生视频'}
                {activeMode === 'style-preset' && (selectedStyle ? selectedStyle.name : '选择风格')}
              </span>
              {processingVideos.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {processingVideos.length} 个任务进行中
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
                    <img src={selectedAsset.url} alt="" className="w-full h-full object-cover" />
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
                    onClick={() => fileInputRef.current?.click()}
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
                    <span className="text-xs font-medium text-white/70">视频作品</span>
                    <span className="text-[10px] text-white/30">({videos.length})</span>
                  </div>
                  <button
                    onClick={() => setShowVideoLibrary(false)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  {videos.length === 0 ? (
                    <div className="text-center py-6">
                      <Film className="w-8 h-8 mx-auto mb-2 text-white/10" />
                      <p className="text-xs text-white/30">暂无视频作品</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1">
                      {videos.map(video => (
                        <div
                          key={video.id}
                          onClick={() => video.status === 'completed' && playVideo(video)}
                          className={`flex-shrink-0 w-44 rounded-xl overflow-hidden border border-white/5 transition-all ${
                            video.status === 'completed' ? 'cursor-pointer hover:scale-[1.02] hover:border-white/20' : ''
                          }`}
                        >
                          <div className="relative aspect-video bg-black/30">
                            {video.imageUrl ? (
                              <img src={video.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                            {video.status === 'completed' && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-[#0a0e1a] ml-0.5" />
                                </div>
                              </div>
                            )}
                            {(video.status === 'pending' || video.status === 'processing') && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                                <p className="text-xs text-white/70">{video.progress}%</p>
                              </div>
                            )}
                            {video.status === 'failed' && (
                              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                                <p className="text-xs text-red-300">生成失败</p>
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white/[0.02]">
                            <p className="text-[11px] text-white/70 truncate">{video.styleName}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-white/30">{video.duration}s</span>
                              {video.status === 'completed' && video.size && (
                                <span className="text-[10px] text-white/30">{video.size}</span>
                              )}
                            </div>
                            {video.status !== 'completed' && (
                              <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                                  style={{ width: `${video.progress}%` }}
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

        {/* 右侧属性面板 */}
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
                            <img src={selectedAsset.url} alt="" className="w-full aspect-video object-cover" />
                            <button
                              onClick={() => setSelectedAsset(null)}
                              className="absolute top-2 right-2 p-1 rounded bg-black/60 hover:bg-black/80 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setLeftTab('assets')}
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

              {rightTab === 'properties' && (
                <div className="space-y-4">
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

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">摄影机设置</label>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-white/60">镜头运动</span>
                          <span className="text-[10px] text-white/40">呼吸感</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10">
                          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-white/60">运镜强度</span>
                          <span className="text-[10px] text-white/40">轻微</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10">
                          <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/50 mb-2 block font-medium">画质增强</label>
                    <div className="space-y-1.5">
                      {['电影级光影', '胶片质感', 'HDR 效果'].map(item => (
                        <div key={item} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02]">
                          <span className="text-xs text-white/60">{item}</span>
                          <div className="w-8 h-4 rounded-full bg-cyan-500/30 relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-cyan-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                  className="w-full aspect-video object-contain bg-black"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <div className="flex items-center justify-between">
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
                        <p className="text-xs text-white/50">{previewVideo.duration}秒 · {previewVideo.size || '--'}</p>
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
