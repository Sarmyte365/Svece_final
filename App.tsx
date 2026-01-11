
import React, { useState } from 'react';
import { AppStatus } from './types';
import { generateProverbStory, generateProverbIllustration } from './services/geminiService';
import CandleVisual from './components/CandleVisual';

const POPULAR_PROVERBS = [
  "Neturi sveci zem pūra",
  "Darbs dara darītāju",
  "Ko sēsi, to pļausi",
  "Runāšana sudrabs, klusēšana zelts",
  "Pēc vārda kabatā nav jāmeklē"
];

interface ImageResult {
  url: string;
  type: 'symbolic' | 'story';
}

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentProverb, setCurrentProverb] = useState<string>("Neturi sveci zem pūra");
  const [inputValue, setInputValue] = useState<string>("");
  const [storyData, setStoryData] = useState<any>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetData = () => {
    setStoryData(null);
    setImages([]);
    setError(null);
  };

  const handleProverbChange = (newProverb: string) => {
    setCurrentProverb(newProverb);
    setInputValue("");
    resetData();
  };

  const handleExplore = async () => {
    if (!currentProverb.trim()) return;
    try {
      resetData();
      setStatus(AppStatus.LOADING_TEXT);
      setError(null);
      
      const data = await generateProverbStory(currentProverb);
      setStoryData(data);
      
      setStatus(AppStatus.LOADING_IMAGE);
      const [symbolicUrl, storyUrl] = await Promise.all([
        generateProverbIllustration(currentProverb, data.story, true),
        generateProverbIllustration(currentProverb, data.story, false)
      ]);
      
      setImages([
        { url: symbolicUrl, type: 'symbolic' },
        { url: storyUrl, type: 'story' }
      ]);
      
      setStatus(AppStatus.IDLE);
    } catch (err: any) {
      console.error(err);
      setError("Neizdevās pilnībā apstrādāt teicienu. Mēģiniet vēlreiz.");
      setStatus(AppStatus.ERROR);
    }
  };

  const showContent = storyData || images.length > 0 || status !== AppStatus.IDLE || error;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 font-sans">
      {/* Header Section */}
      <header className="relative py-12 md:py-20 px-4 text-center bg-wood border-b border-black/40 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex justify-center -mb-8 -mt-10">
             <CandleVisual />
          </div>
          
          <div className="w-full max-w-4xl px-4 mt-6">
            <h1 className="text-4xl md:text-7xl font-bold text-amber-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-10 italic serif leading-tight">
              {currentProverb}
            </h1>
            
            <div className="relative group max-w-xl mx-auto mb-8 shadow-2xl">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder=""
                className="w-full px-6 py-4 md:py-5 bg-[#0a0f1d]/95 border border-amber-900/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600/40 transition-all text-sm md:text-lg shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    handleProverbChange(inputValue);
                  }
                }}
              />
              <button 
                onClick={() => inputValue.trim() && handleProverbChange(inputValue)}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#c05c21] hover:bg-[#a64d1a] text-white rounded-lg transition-colors font-bold text-xs md:text-sm uppercase tracking-widest shadow-lg"
              >
                Mainīt
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {POPULAR_PROVERBS.map(p => (
                <button
                  key={p}
                  onClick={() => handleProverbChange(p)}
                  className={`text-[10px] md:text-xs px-4 py-2 rounded-full border transition-all font-medium uppercase tracking-widest shadow-md ${
                    currentProverb === p 
                    ? 'bg-amber-600/10 text-amber-500 border-amber-500/40' 
                    : 'bg-black/20 hover:bg-black/40 text-slate-400 border-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-12 flex justify-center w-full max-w-md px-6">
            <button 
              onClick={handleExplore}
              disabled={status !== AppStatus.IDLE || !currentProverb}
              className="w-full px-12 py-5 bg-[#c05c21] hover:bg-[#a64d1a] disabled:opacity-50 text-white font-bold text-base md:text-lg uppercase tracking-[0.25em] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all active:scale-95 border border-white/10"
            >
              {status === AppStatus.LOADING_TEXT ? 'Pētām gudrību...' : 
               status === AppStatus.LOADING_IMAGE ? 'Gleznojam ainas...' : 
               'Izpētīt Nozīmi'}
            </button>
          </div>
        </div>
        
        {/* Shadow Overlay at the bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f1d] to-transparent" />
      </header>

      {/* Main Content Area */}
      {showContent && (
        <main className="flex-grow container mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-24">
          {error && (
            <div className="mb-12 p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-red-200 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            {/* Explanation Section */}
            <section className="lg:col-span-7 space-y-16">
              {storyData ? (
                <div className="animate-fade-in space-y-16">
                  <header>
                    <h2 className="text-3xl md:text-4xl font-bold text-amber-500 serif tracking-wide mb-2 uppercase">Gudrības Mantojums</h2>
                    <div className="h-0.5 w-24 bg-amber-900/40" />
                  </header>
                  
                  <div className="space-y-14">
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Skaidrojums</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed">{storyData.definition}</p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Vēsturiskais fons</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed">
                        {storyData.history}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Mūsdienu lietojums</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed">{storyData.modernUsage}</p>
                    </div>

                    <div className="mt-16 p-8 md:p-12 border border-white/5 bg-white/5 rounded-2xl shadow-xl">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-100 serif mb-6 italic tracking-tight">Tautas viedums stāstā</h3>
                      <p className="text-base md:text-lg text-slate-300 leading-relaxed font-light font-sans">
                        {storyData.story}
                      </p>
                    </div>
                  </div>
                </div>
              ) : status === AppStatus.LOADING_TEXT ? (
                 <div className="animate-pulse space-y-12">
                   <div className="h-10 w-64 bg-slate-800 rounded" />
                   <div className="space-y-4">
                     <div className="h-6 w-32 bg-slate-800 rounded" />
                     <div className="h-24 w-full bg-slate-800/50 rounded" />
                   </div>
                   <div className="space-y-4">
                     <div className="h-6 w-32 bg-slate-800 rounded" />
                     <div className="h-24 w-full bg-slate-800/50 rounded" />
                   </div>
                 </div>
              ) : null}
            </section>

            {/* Visual Section */}
            <section className="lg:col-span-5 sticky top-12 space-y-12">
              {images.length > 0 ? (
                <div className="flex flex-col gap-12 animate-fade-in">
                  {images.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 transition-all duration-500 hover:scale-[1.01]">
                      <img 
                        src={img.url} 
                        alt={`${currentProverb} - ${img.type === 'symbolic' ? 'Simboliski' : 'Stāsts'}`} 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (status === AppStatus.LOADING_IMAGE || status === AppStatus.LOADING_TEXT) ? (
                <div className="flex flex-col gap-12">
                  {[0, 1].map((i) => (
                    <div key={i} className="aspect-[16/9] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center border border-white/5">
                      <span className="text-amber-500/20 text-[10px] font-semibold uppercase tracking-[0.4em] serif">Top vizualizācija...</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-16 px-6 bg-black text-center border-t border-white/5 mt-auto">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <span className="text-2xl md:text-3xl uppercase tracking-[0.4em] font-bold text-amber-800/60 serif">Latviešu dzīvesziņa</span>
          <span className="text-xs md:text-sm font-medium text-slate-800 tracking-widest uppercase">2026</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
