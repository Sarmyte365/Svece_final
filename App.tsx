
import React, { useState } from 'react';
import { AppStatus } from './types';
import { generateProverbStory, generateProverbIllustration } from './services/geminiService';
import CandleVisual from './components/CandleVisual';

const POPULAR_PROVERBS = [
  "Neturi sveci zem pūra",
  "Darbs dara darītāju",
  "Ko sēsi, to pļausi",
  "Runāšana sudrabs, klusēšana zelts",
  "Pēc vārda kabatā nav jāmek lē"
];

interface ImageResult {
  url: string;
  type: 'symbolic' | 'story';
}

const LatvianSymbol: React.FC<{ type: 'auseklis' | 'jumis' | 'mara' | 'zalktis', className?: string }> = ({ type, className }) => {
  const symbols = {
    auseklis: <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z M50 20 L80 50 L50 80 L20 50 Z" />,
    jumis: <path d="M20 100 L20 40 L50 10 L80 40 L80 100 M20 60 L80 60 M50 10 L50 60" />,
    mara: <path d="M0 80 L25 20 L50 80 L75 20 L100 80" />,
    zalktis: <path d="M20 20 L80 20 L80 50 L20 50 L20 80 L80 80" />
  };
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      {symbols[type]}
    </svg>
  );
};

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
      
      const imageResults = await Promise.allSettled([
        generateProverbIllustration(currentProverb, data.story, true),
        generateProverbIllustration(currentProverb, data.story, false)
      ]);
      
      const successfulImages: ImageResult[] = [];
      if (imageResults[0].status === 'fulfilled') {
        successfulImages.push({ url: imageResults[0].value, type: 'symbolic' });
      }
      if (imageResults[1].status === 'fulfilled') {
        successfulImages.push({ url: imageResults[1].value, type: 'story' });
      }
      
      setImages(successfulImages);
      
      if (successfulImages.length === 0) {
        setError("Attēlus šobrīd neizdevās uzgleznot, bet vari izlasīt parunas stāstu.");
      }
      
      setStatus(AppStatus.IDLE);
    } catch (err: any) {
      console.error(err);
      setError("Neizdevās apstrādāt teicienu. Mēģiniet vēlreiz.");
      setStatus(AppStatus.ERROR);
    }
  };

  const showContent = storyData || images.length > 0 || status !== AppStatus.IDLE || error;

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100 font-sans relative">
      {/* Dynamic Background Symbols */}
      <LatvianSymbol type="auseklis" className="absolute top-[15%] left-[5%] w-24 h-24 opacity-[0.03] rotate-12 hidden xl:block" />
      <LatvianSymbol type="jumis" className="absolute top-[40%] right-[5%] w-32 h-32 opacity-[0.02] -rotate-12 hidden xl:block" />
      <LatvianSymbol type="zalktis" className="absolute bottom-[20%] left-[8%] w-20 h-20 opacity-[0.02] hidden xl:block" />
      <LatvianSymbol type="mara" className="absolute bottom-[10%] right-[10%] w-28 h-28 opacity-[0.03] hidden xl:block" />

      {/* Header Section */}
      <header className="relative py-12 md:py-24 px-4 text-center bg-artistic-canvas border-b border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex justify-center -mb-8 -mt-14">
             <CandleVisual />
          </div>
          
          <div className="w-full max-w-4xl px-4 mt-6">
            <h1 className="text-4xl md:text-7xl font-bold text-amber-50 drop-shadow-[0_2px_20px_rgba(192,92,33,0.4)] mb-12 italic serif leading-tight">
              {currentProverb}
            </h1>
            
            <div className="relative group max-w-xl mx-auto mb-8 shadow-2xl">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ievadiet citu teicienu..."
                className="w-full px-8 py-4 md:py-5 bg-[#0a0f1d]/90 border border-amber-900/30 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600/40 transition-all text-sm md:text-lg shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    handleProverbChange(inputValue);
                  }
                }}
              />
              <button 
                onClick={() => inputValue.trim() && handleProverbChange(inputValue)}
                className="absolute right-2 top-2 bottom-2 px-8 bg-[#c05c21] hover:bg-[#a64d1a] text-white rounded-full transition-colors font-bold text-xs md:text-sm uppercase tracking-widest shadow-lg"
              >
                Mainīt
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {POPULAR_PROVERBS.map(p => (
                <button
                  key={p}
                  onClick={() => handleProverbChange(p)}
                  className={`text-[10px] md:text-xs px-6 py-2 rounded-full border transition-all font-medium uppercase tracking-widest shadow-md ${
                    currentProverb === p 
                    ? 'bg-amber-600/20 text-amber-400 border-amber-500/40' 
                    : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-14 flex justify-center w-full max-w-md px-6">
            <button 
              onClick={handleExplore}
              disabled={status !== AppStatus.IDLE || !currentProverb}
              className="w-full px-12 py-5 bg-[#c05c21] hover:bg-[#a64d1a] disabled:opacity-50 text-white font-bold text-base md:text-lg uppercase tracking-[0.25em] rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.8)] transition-all active:scale-95 border border-white/10"
            >
              {status === AppStatus.LOADING_TEXT ? 'Pētām gudrību...' : 
               status === AppStatus.LOADING_IMAGE ? 'Gleznojam ainas...' : 
               'Izpētīt Nozīmi'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {showContent && (
        <main className="flex-grow container mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-24 relative z-10">
          {error && (
            <div className="mb-12 p-6 bg-red-950/20 border border-red-900/30 rounded-full text-red-200 text-center text-sm font-medium shadow-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            {/* Explanation Section */}
            <section className="lg:col-span-7 space-y-16">
              {storyData ? (
                <div className="animate-fade-in space-y-16">
                  <header>
                    <div className="flex items-center gap-3 mb-2">
                       <LatvianSymbol type="auseklis" className="w-8 h-8 opacity-20 text-amber-500" />
                       <h2 className="text-3xl md:text-4xl font-bold text-amber-500 serif tracking-wide uppercase">Gudrības Mantojums</h2>
                    </div>
                    <div className="h-0.5 w-24 bg-amber-900/40" />
                  </header>
                  
                  <div className="space-y-14">
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Skaidrojums</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed opacity-90">{storyData.definition}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-l-2 border-amber-900/20 pl-6">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Vēsturiskais fons</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed opacity-90">
                        {storyData.history}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-l-2 border-amber-900/20 pl-6">
                      <h3 className="text-xl md:text-2xl font-semibold text-amber-200 serif">Mūsdienu lietojums</h3>
                      <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed opacity-90">{storyData.modernUsage}</p>
                    </div>

                    <div className="mt-16 p-8 md:p-12 border border-white/5 bg-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                         <LatvianSymbol type="jumis" className="w-16 h-16" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-100 serif mb-6 italic tracking-tight">Tautas viedums stāstā</h3>
                      <p className="text-base md:text-lg text-slate-300 leading-relaxed font-light italic">
                        "{storyData.story}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : status === AppStatus.LOADING_TEXT ? (
                 <div className="animate-pulse space-y-12">
                   <div className="h-10 w-64 bg-slate-800 rounded-full" />
                   <div className="space-y-4">
                     <div className="h-6 w-32 bg-slate-800 rounded-full" />
                     <div className="h-24 w-full bg-slate-800/50 rounded-2xl" />
                   </div>
                   <div className="space-y-4">
                     <div className="h-6 w-32 bg-slate-800 rounded-full" />
                     <div className="h-24 w-full bg-slate-800/50 rounded-2xl" />
                   </div>
                 </div>
              ) : null}
            </section>

            {/* Visual Section */}
            <section className="lg:col-span-5 sticky top-12 space-y-12">
              {images.length > 0 ? (
                <div className="flex flex-col gap-12 animate-fade-in">
                  {images.map((img, idx) => (
                    <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/5 transition-all duration-700 hover:scale-[1.02] bg-black/40">
                      <img 
                        src={img.url} 
                        alt={`${currentProverb} - ${img.type === 'symbolic' ? 'Simboliski' : 'Stāsts'}`} 
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest text-amber-200 font-semibold">
                          {img.type === 'symbolic' ? 'Simboliska interpretācija' : 'Aina no stāsta'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (status === AppStatus.LOADING_IMAGE || status === AppStatus.LOADING_TEXT) ? (
                <div className="flex flex-col gap-12">
                  {[0, 1].map((i) => (
                    <div key={i} className="aspect-[16/9] bg-white/5 animate-pulse rounded-3xl flex items-center justify-center border border-white/5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 opacity-20"><LatvianSymbol type="auseklis" className="animate-spin-slow" /></div>
                        <span className="text-amber-500/20 text-[10px] font-semibold uppercase tracking-[0.4em] serif">Gleznojam ainu...</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-20 px-6 bg-black text-center border-t border-white/5 mt-auto relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <span className="text-2xl md:text-3xl uppercase tracking-[0.5em] font-bold text-amber-800/40 serif">Latviešu dzīvesziņa</span>
          <p className="text-[10px] text-slate-800 tracking-widest uppercase font-medium">Mākslīgā intelekta interpretācija • 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
