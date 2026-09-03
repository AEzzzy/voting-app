'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle, Trophy, X, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

const TypewriterText = ({ text, delay = 0, className, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startTimeout = setTimeout(() => {
      if (isMounted) setStarted(true);
    }, delay);
    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
    };
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    let isMounted = true;
    const timer = setInterval(() => {
      if (!isMounted) return;
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [text, started, speed]);

  return <div className={className} dir="rtl" style={{ fontFamily: 'var(--font-kanzal)' }}>{displayedText}</div>;
};

export default function ResultsPage() {
  const [teams, setTeams] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealStep, setRevealStep] = useState(0); 

  const [resetInput, setResetInput] = useState('');
  const [revealAudio, setRevealAudio] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/reveal-music.webm');
      audio.volume = 0.8;
      setRevealAudio(audio);
    }
  }, []);

  useEffect(() => {
    if (isRevealing) return;

    const fetchResults = async () => {
      try {
        const res = await fetch('/api/teams');
        if (!res.ok) return;
        const data = await res.json();
        
        let total = 0;
        data.forEach(t => total += t.votes);
        
        const sortedData = [...data].sort((a, b) => b.votes - a.votes);
        
        setTeams(sortedData);
        setTotalVotes(total);
      } catch (error) {
        console.error("Error fetching live results:", error);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 1000);
    return () => clearInterval(interval);
  }, [isRevealing]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/teams', { method: 'DELETE' });
      setShowResetConfirm(false);
      setResetInput('');
      setTeams(teams.map(t => ({...t, votes: 0})));
    } catch (error) {
      console.error("Failed to reset:", error);
    }
    setIsResetting(false);
  };

  const handleRevealWinner = () => {
    setRevealStep(3);
    
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100, colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981', '#ffffff'] };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  // Ultra-compact Reveal Card so it never scrolls
  const RevealCard = ({ team, rankText, medalGradient, glowColor, medalIcon, delay = 0 }) => (
    <motion.div 
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative p-4 md:p-5 rounded-[1.5rem] flex flex-col items-center w-48 md:w-56 z-20 border-[3px] border-amber-300/50"
      style={{ 
        boxShadow: `0 0 50px ${glowColor}, inset 0 0 20px rgba(251, 191, 36, 0.15)`,
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-[1.5rem] opacity-70 pointer-events-none" />
      
      <div className="text-4xl md:text-5xl mb-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] relative z-10">{medalIcon}</div>
      <div className="font-black tracking-[0.2em] uppercase mb-1 text-[9px] relative z-10 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
        {rankText}
      </div>
      
      <h3 className="text-xl md:text-2xl font-normal text-white mb-3 text-center leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,1)] relative z-10" style={{ fontFamily: 'var(--font-kanzal)' }} dir="rtl">{team.name}</h3>
      
      <div className={`flex flex-col items-center w-full rounded-xl py-2 md:py-3 border-[2px] border-white/30 relative z-10 ${medalGradient} shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]`}>
        <span className="text-white/90 text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase mb-0.5 drop-shadow-md">Total Votes</span>
        <span className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">{team.votes}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-amber-500/20 relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* ---------------- COMPACT PREMIUM DASHBOARD ---------------- */}
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60 p-6 md:p-10 relative z-10 flex flex-col">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500">Live Data Feed</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Results <span className="font-light text-slate-400">Dashboard</span></h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
              Total Registered Votes: <span className="text-slate-900">{totalVotes}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => {
                setRevealStep(0);
                setIsRevealing(true);
                if (revealAudio) {
                  revealAudio.currentTime = 0;
                  revealAudio.play().catch(e => console.error('Audio play blocked:', e));
                }
              }}
              disabled={teams.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy size={16} className="text-amber-400" />
              Announce
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 px-6 py-3 rounded-xl border border-slate-200 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-3 md:gap-4 flex-1">
          {teams.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-20">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-[0.3em]">Awaiting data...</p>
            </div>
          )}
          
          <AnimatePresence>
            {teams.map((team, index) => {
              const percentage = totalVotes > 0 ? ((team.votes / totalVotes) * 100) : 0;
              
              const premiumColors = [
                'bg-gradient-to-r from-amber-500 to-yellow-400',
                'bg-gradient-to-r from-slate-600 to-slate-400',
                'bg-gradient-to-r from-orange-600 to-orange-400',
                'bg-gradient-to-r from-indigo-600 to-blue-500'
              ];
              const barColor = premiumColors[index] || premiumColors[3];

              return (
                <motion.div 
                  key={team.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col relative"
                >
                  <div className="flex justify-between items-end mb-2 px-1 relative z-10">
                    <div className="flex items-baseline gap-4 md:gap-6">
                      <span className="text-xl md:text-2xl font-light text-slate-300 w-6">0{index + 1}</span>
                      <div>
                        <h3 className="text-lg md:text-xl font-normal text-slate-800 tracking-wide" style={{ fontFamily: 'var(--font-kanzal)' }} dir="rtl">{team.name}</h3>
                        <p className="text-[10px] text-slate-400 tracking-[0.15em] font-bold uppercase mt-1">{team.englishName}</p>
                      </div>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-slate-900">{team.votes}</span>
                  </div>
                  
                  <div className="h-3 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <motion.div 
                      className={`absolute top-0 bottom-0 left-0 ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>


      {/* ---------------- PROPORTIONATE REVEAL OVERLAY (NO SCROLLING) ---------------- */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 h-screen w-screen z-50 flex flex-col items-center justify-end overflow-hidden"
          >
            {/* The PREMIUM Voting App Background Image */}
            <div className="absolute inset-0 bg-[url('/bg-clean.jpg')] bg-cover bg-center bg-no-repeat" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Exit Button - Top Right */}
            <button 
              onClick={() => {
                setIsRevealing(false);
                if (revealAudio) {
                  revealAudio.pause();
                  revealAudio.currentTime = 0;
                }
              }} 
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white transition-colors bg-black/40 hover:bg-black/60 p-3 rounded-full shadow-lg border border-amber-500/30 z-50 backdrop-blur-md"
            >
              <X size={20} />
            </button>

            {/* Floating Action Buttons - Fixed on the Bottom Left so they don't block the podiums */}
            <div className="absolute bottom-8 left-8 z-50 flex flex-col gap-3">
              {revealStep === 0 && (
                <button onClick={() => setRevealStep(1)} className="px-8 py-4 bg-black/60 backdrop-blur-md hover:bg-black/80 text-amber-500 rounded-2xl text-xs md:text-sm font-black tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all hover:scale-105 active:scale-95 border border-amber-500/50">
                  Begin Reveal
                </button>
              )}
              {revealStep === 1 && (
                <button onClick={() => setRevealStep(2)} className="px-8 py-4 bg-black/60 backdrop-blur-md hover:bg-black/80 text-amber-500 rounded-2xl text-xs md:text-sm font-black tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all hover:scale-105 active:scale-95 border border-amber-500/50">
                  Next: Runner Up
                </button>
              )}
              {revealStep === 2 && (
                <button onClick={handleRevealWinner} className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black rounded-2xl text-xs md:text-sm font-black tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 border-2 border-yellow-200">
                  Reveal Winner
                </button>
              )}
            </div>

            {/* Arabic Congratulations Typing Effect */}
            {revealStep >= 3 && (
              <div className="absolute top-[8%] md:top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-4 z-50 w-full text-center pointer-events-none">
                <TypewriterText 
                  text="مبارك مهنى!" 
                  delay={1200} 
                  className="text-5xl md:text-7xl font-normal text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]" 
                />
                <TypewriterText 
                  text="اعز الله قدركم" 
                  delay={2500} 
                  className="text-3xl md:text-5xl font-normal text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" 
                />
              </div>
            )}

            {/* Podiums - Scaled using vh (viewport height) to guarantee they fit on any screen */}
            <div className="flex flex-row items-end justify-center w-full max-w-5xl px-4 gap-2 md:gap-4 relative z-10 h-full pb-0">
              
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1">
                <AnimatePresence>
                  {revealStep >= 2 && teams.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                      className="flex flex-col items-center w-full relative"
                    >
                      <RevealCard 
                        team={teams[1]} 
                        rankText="Second Place" 
                        medalGradient="bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600" 
                        glowColor="rgba(148, 163, 184, 0.6)" 
                        medalIcon="🥈" 
                      />
                      
                      {/* Clean gradient podium, NO background image inside it so no messy letters show up */}
                      <div className="w-full h-[18vh] mt-[-20px] pt-4 relative flex items-center justify-center bg-gradient-to-b from-slate-400 to-slate-800 border-t-[4px] border-slate-200 shadow-[0_0_40px_rgba(148,163,184,0.4)] rounded-t-[1.5rem] z-0 overflow-hidden">
                        <span className="text-4xl md:text-5xl font-black text-slate-200/40 drop-shadow-md">II</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 1st Place (Winner) */}
              <div className="flex flex-col items-center flex-1 z-20">
                <AnimatePresence>
                  {revealStep >= 3 && teams.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 80 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ type: "spring", bounce: 0.5, duration: 1.2, delay: 0.2 }}
                      className="flex flex-col items-center w-full relative"
                    >
                      <RevealCard 
                        team={teams[0]} 
                        rankText="Grand Winner" 
                        medalGradient="bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700" 
                        glowColor="rgba(251, 191, 36, 0.8)" 
                        medalIcon="🏆" 
                      />
                      
                      <div className="w-full h-[28vh] mt-[-20px] pt-6 relative flex items-center justify-center bg-gradient-to-b from-amber-500 to-amber-950 border-t-[6px] border-yellow-300 shadow-[0_0_60px_rgba(251,191,36,0.6)] rounded-t-[1.5rem] z-0 overflow-hidden">
                        <span className="text-6xl md:text-7xl font-black text-amber-300/40 drop-shadow-lg">I</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1">
                <AnimatePresence>
                  {revealStep >= 1 && teams.length > 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                      className="flex flex-col items-center w-full relative"
                    >
                      <RevealCard 
                        team={teams[2]} 
                        rankText="Third Place" 
                        medalGradient="bg-gradient-to-br from-red-800 via-orange-900 to-stone-900" 
                        glowColor="rgba(153, 27, 27, 0.6)" 
                        medalIcon="🥉" 
                      />
                      
                      <div className="w-full h-[12vh] mt-[-20px] pt-2 relative flex items-center justify-center bg-gradient-to-b from-orange-900 to-stone-950 border-t-[4px] border-red-800 shadow-[0_0_40px_rgba(153,27,27,0.4)] rounded-t-[1.5rem] z-0 overflow-hidden">
                        <span className="text-3xl md:text-4xl font-black text-red-400/30 drop-shadow-md">III</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- RESET MODAL ---------------- */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[1.5rem] max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold text-slate-900">Danger Zone</h2>
            </div>
            
            <p className="text-slate-600 mb-6 text-sm leading-relaxed font-medium">
              This action will permanently zero out all incoming votes for a new round. This cannot be undone.
            </p>

            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Type "confirm reset" to proceed
              </label>
              <input 
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="confirm reset"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetInput('');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest transition-all"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting || resetInput.toLowerCase() !== 'confirm reset'}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : 'Reset Votes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
