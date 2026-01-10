import React, { useState, useEffect } from 'react';

const CandleVisual: React.FC = () => {
  const [intensity, setIntensity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntensity(0.85 + Math.random() * 0.3);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-48 w-40 select-none scale-75 md:scale-90">
      {/* Flame */}
      <div 
        className="absolute top-[1.5rem] w-3 h-10 bg-gradient-to-t from-orange-600 via-amber-400 to-amber-50 rounded-t-[80%] rounded-b-[20%] blur-[0.3px] transition-all duration-100 z-20 origin-bottom"
        style={{ 
          transform: `scale(${intensity})`,
          opacity: 0.9 + intensity * 0.1,
          boxShadow: `0 0 ${20 * intensity}px ${10 * intensity}px rgba(251, 191, 36, 0.4)`
        }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500/40 blur-[1px] rounded-full" />
      </div>
      
      {/* Inner Flame Core */}
      <div className="absolute top-[2.2rem] w-1.5 h-6 bg-white/90 rounded-t-full rounded-b-full blur-[1px] z-30 opacity-70" />
      
      {/* Candle body */}
      <div className="absolute top-[4.2rem] w-4 h-24 bg-gradient-to-r from-stone-100 via-white to-stone-200 rounded-sm z-10 shadow-sm" />
      
      {/* Clay Holder */}
      <div className="absolute bottom-6 w-full flex flex-col items-center">
        {/* Clay Sleeve */}
        <div className="w-6 h-6 bg-[#8c4a32] rounded-t-md border-b border-black/10 shadow-inner z-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #a65d44, #733c2a)' }} />
        
        {/* Clay Base Dish */}
        <div className="relative w-20 h-4 bg-[#733c2a] rounded-full shadow-xl z-20 border-t border-[#8c4a32]/30 overflow-hidden">
            <div className="absolute inset-0 bg-black/10 opacity-40" />
        </div>
      </div>

      {/* Ground Light Reflection */}
      <div className="absolute bottom-0 w-32 h-6 bg-amber-600/10 blur-2xl rounded-full" />
    </div>
  );
};

export default CandleVisual;