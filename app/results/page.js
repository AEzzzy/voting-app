'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle, Trophy, X, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsPage() {
  const [teams, setTeams] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealStep, setRevealStep] = useState(0); 

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
      setTeams(teams.map(t => ({...t, votes: 0})));
    } catch (error) {
      console.error("Failed to reset:", error);
    }
    setIsResetting(false);
  };

  const handleRevealWinner = () => {
    setRevealStep(3);
    
    // Fire rich gold confetti
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'] };

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

  // The new PREMIUM Reveal Card!
  const RevealCard = ({ team, rankText, medalColor, shadowColor, medalIcon, delay = 0 }) => (
    <motion.div 
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`relative p-6 md:p-8 rounded-[2rem] flex flex-col items-center w-64 md:w-80 z-20 border-2 ${team?.borderColor || 'border-amber-400/30'}`}
      style={{ 
        boxShadow: `0 0 40px ${team?.glowColor || shadowColor}`,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent rounded-[2rem] opacity-50" />
      
      <div className="text-5xl md:text-6xl mb-4 filter drop-shadow-2xl relative z-10">{medalIcon}</div>
      <div className="font-black tracking-[0.2em] uppercase mb-4 text-[10px] md:text-xs relative z-10" style={{ color: medalColor }}>{rankText}</div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white mb-8 text-center leading-tight drop-shadow-lg relative z-10" dir="rtl">{team.name}</h3>
      
      <div className={`flex flex-col items-center w-full rounded-2xl ${team?.color || 'bg-slate-900/90'} py-4 border-t border-white/10 relative z-10`}>
        <span className="text-white/60 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1">Total Votes</span>
        <span className="text-4xl md:text-5xl font-black text-white drop-shadow-md">{team.votes}</span>
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
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-wide" dir="rtl">{team.name}</h3>
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


      {/* ---------------- PROPORTIONATE REVEAL OVERLAY ---------------- */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-8 pt-12 md:pt-16 overflow-y-auto"
          >
            {/* The PREMIUM Voting App Background Image */}
            <div 
              className="absolute inset-0 bg-[url('/bg-clean.jpg')] bg-cover bg-center bg-no-repeat"
            />
            {/* Dark overlay to make the text pop and give it that cinematic feel */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <button 
              onClick={() => setIsRevealing(false)} 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors bg-black/40 hover:bg-black/60 p-3 md:p-4 rounded-full shadow-lg border border-white/10 z-50 backdrop-blur-md"
            >
              <X size={20} />
            </button>

            {/* Scaled-down Podium */}
            <div className="flex-1 flex items-end justify-center w-full max-w-6xl pb-16 md:pb-24 gap-4 md:gap-8 relative z-10 mt-10">
              
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
                      <RevealCard team={teams[1]} rankText="Second Place" medalColor="#cbd5e1" shadowColor="rgba(203, 213, 225, 0.4)" medalIcon="🥈" />
                      
                      <div className="w-full h-32 md:h-48 mt-[-15px] pt-8 relative flex items-center justify-center bg-slate-800/80 backdrop-blur-md border-t-[4px] border-slate-300 shadow-xl rounded-t-[2rem] z-0">
                        <span className="text-5xl md:text-6xl font-black text-white/20">II</span>
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
                      <RevealCard team={teams[0]} rankText="Grand Winner" medalColor="#fbbf24" shadowColor="rgba(251, 191, 36, 0.5)" medalIcon="🏆" />
                      
                      <div className="w-full h-48 md:h-64 mt-[-15px] pt-10 relative flex items-center justify-center bg-amber-900/40 backdrop-blur-md border-t-[6px] border-amber-400 shadow-2xl rounded-t-[2rem] z-0">
                        <span className="text-6xl md:text-7xl font-black text-amber-400/20">I</span>
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
                      <RevealCard team={teams[2]} rankText="Third Place" medalColor="#f97316" shadowColor="rgba(249, 115, 22, 0.4)" medalIcon="🥉" />
                      
                      <div className="w-full h-24 md:h-32 mt-[-15px] pt-6 relative flex items-center justify-center bg-orange-950/60 backdrop-blur-md border-t-[4px] border-orange-500 shadow-xl rounded-t-[2rem] z-0">
                        <span className="text-4xl md:text-5xl font-black text-orange-500/20">III</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Scaled-down Reveal Controls */}
            <div className="mt-6 mb-2 relative z-50 flex gap-3 md:gap-4">
              {revealStep === 0 && (
                <button onClick={() => setRevealStep(1)} className="px-8 py-3 md:py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/20">
                  Begin Reveal
                </button>
              )}
              {revealStep === 1 && (
                <button onClick={() => setRevealStep(2)} className="px-8 py-3 md:py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/20">
                  Next: Runner Up
                </button>
              )}
              {revealStep === 2 && (
                <button onClick={handleRevealWinner} className="px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-[0_10px_30px_rgba(217,119,6,0.5)] transition-all hover:scale-105 active:scale-95 border border-amber-300">
                  Reveal Winner
                </button>
              )}
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
              <h2 className="text-xl font-bold text-slate-900">Reset Database</h2>
            </div>
            
            <p className="text-slate-600 mb-8 text-sm leading-relaxed font-medium">
              This action will permanently zero out all incoming votes. Proceed to initialize a new round?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest transition-all"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isResetting ? 'Resetting...' : 'Yes, Zero Votes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
