import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Film,
  Download,
  Play,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Wand2,
  Image as ImageIcon,
  Settings2,
  ChevronDown,
  Zap,
  Palette,
  Layers,
  ArrowRight,
  X,
  Maximize2
} from 'lucide-react';
import './index.css';

const API_BASE = '/api';

const STYLES = [
  { id: 'wuxia', name: '武侠意境', description: '古典武侠雨夜庭院', gradient: 'from-amber-500 to-red-600', icon: '⚔️' },
  { id: 'cyberpunk-mecha', name: '赛博机甲', description: '赛博朋克霓虹机甲', gradient: 'from-cyan-400 to-blue-600', icon: '🤖' },
  { id: 'scifi-transformation', name: '科幻变身', description: '未来科技机甲觉醒', gradient: 'from-blue-500 to-purple-600', icon: '✨' },
  { id: 'cozy-pet', name: '治愈萌宠', description: '温暖治愈人宠陪伴', gradient: 'from-yellow-400 to-orange-500', icon: '🐕' },
  { id: 'weapon-energy', name: '能量武器', description: '科幻能量武器充能', gradient: 'from-amber-400 to-red-500', icon: '⚡' },
  { id: 'ocean-sunset', name: '海边日落', description: '绝美海边日落氛围', gradient: 'from-orange-400 to-pink-500', icon: '🌅' },
  { id: 'fantasy-forest', name: '奇幻森林', description: '魔法森林梦幻光影', gradient: 'from-emerald-400 to-teal-500', icon: '🌲' },
  { id: 'anime-style', name: '动漫风格', description: '日系动漫精美画风', gradient: 'from-pink-400 to-purple-500', icon: '🎨' },
];

const STATUS_STAGES = {
  pending: { label: '排队中', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  processing: { label: '生成中', color: 'text-cyan-400', bg: 'bg-cyan-400/20' },
  completed: { label: '已完成', color: 'text-green-400', bg: 'bg-green-400/20' },
  failed: { label: '失败', color: 'text-red-400', bg: 'bg-red-400/20' },
};

function App() {
  const [videos, setVideos] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [duration, setDuration] = useState(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchStyles();
    
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (e) {
      console.error('Failed to fetch videos:', e);
    }
  };

  const fetchStyles = async () => {
    try {
      const res = await fetch(`${API_BASE}/styles`);
      const data = await res.json();
      setStyles(data.styles || []);
    } catch (e) {
      console.error('Failed to fetch styles:', e);
    }
  };

  const generateVideo = async () => {
    if (!selectedStyle) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/videos/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId: selectedStyle,
          seconds: duration,
          customPrompt: customPrompt || undefined
        })
      });
      const data = await res.json();
      
      if (data.id) {
        fetchVideos();
        setShowGenerator(false);
        setCustomPrompt('');
      }
    } catch (e) {
      console.error('Generate failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* 背景效果 */}
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900 pointer-events-none" />
      
      {/* 顶部导航 */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 glass border-b border-purple-500/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">Agnes AI Studio</h1>
              <p className="text-xs text-gray-400">电影级 AI 视频生成工作台</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-medium text-sm glow-purple"
          >
            <Wand2 className="w-4 h-4" />
            创建视频
          </button>
        </div>
      </motion.nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero 区域 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-300">基于 Mx-Shell 5段式方法论</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">电影级</span> AI 视频
            <br />
            <span className="text-white">一键生成</span>
          </h2>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            选择风格，一键生成具有电影质感的 AI 视频。
            <br className="hidden md:block" />
            融合专业摄影技法与 5段式提示词工程。
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              8种电影风格
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              图生视频模式
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              自定义提示词
            </div>
          </div>
        </motion.div>

        {/* 视频库 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                <Layers className="w-6 h-6 text-purple-400" />
                视频作品
              </h3>
              <p className="text-gray-500 text-sm mt-1">{videos.length} 个视频</p>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-light flex items-center justify-center">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">还没有视频</h4>
              <p className="text-gray-400 text-sm mb-6">选择一个风格，创建你的第一个 AI 视频</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-medium text-sm"
              >
                <Wand2 className="w-4 h-4" />
                开始创建
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    index={index}
                    onClick={() => video.status === 'completed' && setShowPlayer(video)}
                    onDownload={(e) => {
                      e.stopPropagation();
                      window.open(video.videoUrl, '_blank');
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      {/* 生成面板 */}
      <AnimatePresence>
        {showGenerator && (
          <GeneratePanel
            styles={STYLES}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            duration={duration}
            setDuration={setDuration}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            isGenerating={isGenerating}
            onGenerate={generateVideo}
            onClose={() => setShowGenerator(false)}
          />
        )}
      </AnimatePresence>

      {/* 视频播放器弹窗 */}
      <AnimatePresence>
        {showPlayer && (
          <VideoPlayer
            video={showPlayer}
            onClose={() => setShowPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoCard({ video, index, onClick, onDownload }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const status = STATUS_STAGES[video.status] || STATUS_STAGES.pending;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && video.status === 'completed') {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`video-card group relative rounded-2xl overflow-hidden glass cursor-pointer`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 视频/缩略图区域 */}
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {video.status === 'completed' ? (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
            {!isHovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            )}
          </>
        ) : video.imageUrl ? (
          <img
            src={video.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full glass-light flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        )}

        {/* 状态徽章 */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.bg} ${status.color} backdrop-blur-md`}>
          {video.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
          {video.status === 'completed' && <CheckCircle className="w-3 h-3" />}
          {video.status === 'failed' && <XCircle className="w-3 h-3" />}
          {video.status === 'pending' && <Clock className="w-3 h-3" />}
          {status.label}
        </div>

        {/* 时长 */}
        {video.status === 'completed' && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-mono text-white">
            {video.duration}s
          </div>
        )}

        {/* 进度条 */}
        {(video.status === 'processing' || video.status === 'pending') && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
            <div
              className="h-full progress-bar transition-all duration-500"
              style={{ width: `${video.progress}%` }}
            />
          </div>
        )}

        {/* 下载按钮 */}
        {video.status === 'completed' && (
          <button
            onClick={onDownload}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* 信息区域 */}
      <div className="p-4">
        <h4 className="font-medium text-white text-sm truncate">{video.styleName}</h4>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(video.createdAt)}
          </span>
          {video.size && <span>{video.size}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function GeneratePanel({
  styles,
  selectedStyle,
  setSelectedStyle,
  duration,
  setDuration,
  customPrompt,
  setCustomPrompt,
  isGenerating,
  onGenerate,
  onClose
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass rounded-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="mb-8">
          <h3 className="font-display text-2xl font-bold gradient-text mb-2">创建视频</h3>
          <p className="text-gray-400 text-sm">选择风格，配置参数，一键生成电影级视频</p>
        </div>

        {/* 风格选择 */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
            <Palette className="w-4 h-4 text-purple-400" />
            选择风格
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative p-4 rounded-2xl transition-all duration-300 text-left ${
                  selectedStyle === style.id
                    ? 'bg-gradient-to-br ' + style.gradient + ' ring-2 ring-white/30 scale-105'
                    : 'glass-light hover:glass'
                }`}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className={`font-medium text-sm ${selectedStyle === style.id ? 'text-white' : 'text-gray-200'}`}>
                  {style.name}
                </div>
                <div className={`text-xs mt-0.5 ${selectedStyle === style.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {style.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 时长设置 */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            视频时长
          </label>
          <div className="flex gap-3">
            {[3, 5, 8, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                  duration === sec
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white glow-cyan'
                    : 'glass-light text-gray-400 hover:text-white'
                }`}
              >
                {sec} 秒
              </button>
            ))}
          </div>
        </div>

        {/* 自定义提示词 */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
            <Wand2 className="w-4 h-4 text-pink-400" />
            自定义描述（可选）
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="描述你想要的画面效果，例如：一只可爱的橘猫在阳光下打滚..."
            className="w-full h-24 px-4 py-3 rounded-xl bg-dark-800/50 border border-purple-500/20 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={onGenerate}
          disabled={!selectedStyle || isGenerating}
          className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-3 transition-all duration-300 ${
            selectedStyle && !isGenerating
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 glow-purple'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              开始生成视频
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

function VideoPlayer({ video, onClose }) {
  const videoRef = useRef(null);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `${video.styleName}_${video.id}.mp4`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 视频播放器 */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black glow-purple">
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 视频信息 */}
        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                {video.styleName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {video.duration} 秒
                </span>
                {video.size && (
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    {video.size}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-medium text-sm glow-purple"
            >
              <Download className="w-4 h-4" />
              下载视频
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default App;
