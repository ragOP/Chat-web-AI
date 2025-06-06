import React, { useState, useEffect } from 'react';

const states = [
  { message: "Scanning Benefits", percentage: 12 },
  { message: "Analyzing Eligibility", percentage: 25 },
  { message: "Matching Location", percentage: 47 },
  { message: "Matching Location", percentage: 65 },
  { message: "Locking Subsidies", percentage: 87 },
  { message: "Locking Subsidies", percentage: 95 },
  { message: "Securing Access", percentage: 100 },
];

const LoaderWithStates = ({ onComplete }) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    const totalDuration = 15000; // 15 seconds total

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);

      // Find the appropriate state based on progress
      const nextStateIndex = states.findIndex(state => newProgress <= state.percentage);
      const stateIndex = nextStateIndex === -1 ? states.length - 1 : nextStateIndex;
      
      setCurrentStateIndex(stateIndex);
      setProgress(states[stateIndex].percentage);

      if (newProgress >= 100) {
        if (onComplete) onComplete();
        return;
      }

      requestAnimationFrame(updateProgress);
    };

    const animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black min-h-screen">
      <div className="relative w-[140px] h-[140px]">
        {/* Background circle */}
        <div 
          className="absolute inset-[5px] rounded-full border-[5px] opacity-30"
          style={{ borderColor: '#4B4B4B' }}
        ></div>
        
        {/* Progress circle */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          style={{ filter: 'drop-shadow(0px 0px 1px rgba(255, 184, 0, 0.5))' }}
        >
          <circle
            cx="70"
            cy="70"
            r="67.5"
            strokeWidth="5"
            stroke="#FFB800"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 67.5}`}
            strokeDashoffset={`${2 * Math.PI * 67.5 * (1 - progress / 100)}`}
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              filter: 'drop-shadow(0px 0px 2px rgba(255, 184, 0, 0.5))'
            }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[32px] font-normal text-white" style={{ textShadow: '0px 0px 4px rgba(255, 255, 255, 0.25)' }}>
            {progress}%
          </span>
        </div>
      </div>
      
      {/* State message */}
      <div 
        className="mt-6 text-[15px] text-white font-normal"
        style={{ 
          opacity: 0.9,
          textShadow: '0px 0px 4px rgba(255, 255, 255, 0.15)'
        }}
      >
        {states[currentStateIndex].message}
      </div>
    </div>
  );
};

export default LoaderWithStates; 