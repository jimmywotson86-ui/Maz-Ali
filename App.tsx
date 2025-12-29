
import React, { useState, useCallback } from 'react';
import { analyzeVideoLink, generateThumbnail } from './services/gemini';
import { VideoInfo, GenerationSettings, AppStatus } from './types';
import { 
  Youtube, 
  Sparkles, 
  Search, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Image as ImageIcon,
  Palette,
  Layers
} from 'lucide-react';

const STYLES = [
  "MrBeast Style (High Contrast, Vibrant)",
  "Clean & Minimalist",
  "Cyberpunk / Neon",
  "Cinematic / Moody",
  "Educational / Infographic",
  "Gaming / Intense",
  "3D Render / Glossy"
];

const ASPECT_RATIOS: GenerationSettings['aspectRatio'][] = ["16:9", "9:16", "1:1"];

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: "16:9",
    style: STYLES[0],
    extraPrompt: ""
  });

  const handleAnalyze = async () => {
    if (!url) return;
    setStatus(AppStatus.ANALYZING);
    setError(null);
    try {
      const info = await analyzeVideoLink(url);
      setVideoInfo(info);
      setStatus(AppStatus.READY_TO_GENERATE);
    } catch (err: any) {
      setError(err.message || "Failed to analyze video. Check the URL.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerate = async () => {
    if (!videoInfo) return;
    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      const img = await generateThumbnail(videoInfo, settings);
      setGeneratedImage(img);
      setStatus(AppStatus.READY_TO_GENERATE);
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail.");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `thumbnail-${videoInfo?.id || 'ai'}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/10 py-4 px-6 sticky top-0 bg-[#0f0f0f]/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ThumbnailAI <span className="text-red-600">Pro</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">How it works</a>
            <a href="#" className="hover:text-white transition-colors">Styles</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="flex flex-col gap-12">
          
          {/* Input Section */}
          <section className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                The AI Creator Toolkit
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Paste your video link and let Gemini design high-converting thumbnails in seconds.
              </p>
            </div>

            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-[#1a1a1a] rounded-2xl p-2 border border-white/10 shadow-2xl">
                <div className="flex-1 flex items-center px-4">
                  <Youtube className="text-white/40 w-5 h-5 mr-3" />
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="bg-transparent border-none outline-none w-full text-lg py-3 focus:ring-0"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={status === AppStatus.ANALYZING || !url}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  {status === AppStatus.ANALYZING ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {status === AppStatus.ANALYZING ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </section>

          {/* Results Area */}
          {videoInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Left Column: Settings */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Palette className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Visual Style</label>
                      <select 
                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-colors"
                        value={settings.style}
                        onChange={(e) => setSettings(s => ({...s, style: e.target.value}))}
                      >
                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Aspect Ratio</label>
                      <div className="flex gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => setSettings(s => ({...s, aspectRatio: ratio}))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                              settings.aspectRatio === ratio 
                              ? 'bg-white text-black border-white' 
                              : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Refine with AI (Optional)</label>
                      <textarea 
                        placeholder="Add a red circle on the focal point, make the background blurred..."
                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-colors h-32 resize-none text-sm"
                        value={settings.extraPrompt}
                        onChange={(e) => setSettings(s => ({...s, extraPrompt: e.target.value}))}
                      />
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={status === AppStatus.GENERATING}
                      className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:cursor-not-allowed font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
                    >
                      {status === AppStatus.GENERATING ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          Painting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate Design
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={videoInfo.originalThumbnail} 
                      className="w-20 h-12 object-cover rounded-lg ring-1 ring-white/20"
                      alt="Original"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-red-500 font-bold">CURRENT VIDEO</p>
                      <p className="text-sm font-medium truncate text-white/80">{videoInfo.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Canvas */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="relative group flex-1 min-h-[400px] bg-[#1a1a1a] border border-white/10 rounded-[32px] overflow-hidden flex items-center justify-center">
                  {!generatedImage && status !== AppStatus.GENERATING && (
                    <div className="text-center space-y-4 p-8">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-2xl font-bold">Your Canvas is Ready</h3>
                      <p className="text-white/40 max-w-sm mx-auto">
                        Customize the settings on the left and click "Generate Design" to see the magic happen.
                      </p>
                    </div>
                  )}

                  {status === AppStatus.GENERATING && (
                    <div className="absolute inset-0 z-10 bg-[#0f0f0f]/60 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center">
                       <div className="relative mb-8">
                          <div className="w-24 h-24 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-red-600 animate-pulse" />
                       </div>
                       <div className="space-y-3">
                        <h4 className="text-xl font-bold">Generating Thumbnail</h4>
                        <p className="text-white/60 animate-pulse">Gemini is rendering your creative vision...</p>
                        <div className="flex gap-2 justify-center mt-4">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                        </div>
                       </div>
                    </div>
                  )}

                  {generatedImage && (
                    <div className="relative w-full h-full flex flex-col">
                      <div className="relative flex-1 bg-[#0f0f0f] flex items-center justify-center p-4">
                        <img 
                          src={generatedImage} 
                          className={`max-w-full max-h-full object-contain shadow-2xl rounded-xl transition-all duration-1000 ${status === AppStatus.GENERATING ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
                          alt="Generated AI Thumbnail" 
                        />
                      </div>
                      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Preview Result</p>
                            <p className="text-xs text-white/40">1920x1080 (HD Equivalent)</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={handleGenerate}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={downloadImage}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">
                  <h4 className="text-sm font-bold text-white/40 uppercase mb-4">Video Context Analysed</h4>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">{videoInfo.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed italic border-l-2 border-red-600/50 pl-4">
                      "{videoInfo.description}"
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center">
                        <Youtube className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-white/40">{videoInfo.channelName}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-12 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-red-600/20 p-1 rounded">
              <Youtube className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-bold text-white/80">ThumbnailAI Pro</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p>© {new Date().getFullYear()} AI Creative Studio. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
