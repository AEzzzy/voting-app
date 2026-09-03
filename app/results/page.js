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
      setTotalVotes(0);
    } catch (err) {
      console.error(err);
      alert("Failed to reset votes.");
    } finally {
      setIsResetting(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#D4AF37', '#FFDF73', '#C5B358', '#E6E8FA', '#8A95A5'];

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 40 * (timeLeft / duration);
      confetti(Object.assign({}, { startVelocity: 30, spread: 360, ticks: 100, zIndex: 100, colors }, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      }));
      confetti(Object.assign({}, { startVelocity: 30, spread: 360, ticks: 100, zIndex: 100, colors }, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      }));
    }, 250);
    
    confetti({
      particleCount: 150,
      spread: 120,
      startVelocity: 45,
      origin: { y: 1 },
      colors
    });
  };

  const handleRevealWinner = () => {
    setRevealStep(3);
    triggerConfetti();
  };

  // Scaled down, perfectly proportioned Reveal Card
  const RevealCard = ({ team, rankText, medalColor, shadowColor, medalIcon }) => (
    <motion.div 
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative p-6 md:p-8 rounded-2xl bg-white flex flex-col items-center w-64 md:w-72 z-20 border border-slate-100"
      style={{ boxShadow: `0 15px 35px -10px ${shadowColor}` }}
    >
      <div className="text-5xl md:text-6xl mb-4 filter drop-shadow-md">{medalIcon}</div>
      <div className="font-bold tracking-[0.15em] uppercase mb-3 text-[10px] md:text-xs" style={{ color: medalColor }}>{rankText}</div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center leading-tight" dir="rtl">{team.name}</h3>
      
      <div className="flex items-center gap-2 bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100 shadow-inner">
        <span className="text-3xl md:text-4xl font-black text-slate-900">{team.votes}</span>
        <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Votes</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-amber-500/20 relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* ---------------- COMPACT PREMIUM DASHBOARD ---------------- */}
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60 p-6 md:p-10 relative z-10 flex flex-col">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Live Data Feed</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Results <span className="font-light text-slate-400">Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-2 text-[10px] md:text-xs uppercase tracking-widest font-semibold">
              Total Registered Votes: <span className="text-slate-900 font-black ml-1 text-sm md:text-base">{totalVotes}</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => { setIsRevealing(true); setRevealStep(0); }}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-1 text-xs uppercase tracking-[0.1em] font-bold"
            >
              <Trophy size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
              Announce
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 px-5 py-3 rounded-full transition-all border border-slate-200 hover:border-red-200 shadow-sm text-[10px] md:text-xs uppercase tracking-[0.1em] font-bold"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </header>

        {/* Scaled-down Bar Chart */}
        <div className="flex-1 flex flex-col justify-center gap-6 md:gap-8 max-w-3xl mx-auto w-full">
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
              <div key={team.id} className="relative group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-baseline gap-4 md:gap-5">
                    <span className="text-2xl md:text-3xl font-black text-slate-200 w-8 md:w-10">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-wide" dir="rtl">{team.name}</h3>
                      <p className="text-[10px] text-slate-400 tracking-[0.15em] font-bold uppercase mt-1">{team.englishName}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-black text-slate-900">{team.votes}</span>
                  </div>
                </div>

                <div className="h-2 md:h-2.5 bg-slate-100 rounded-full overflow-hidden w-full relative shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }} 
                    className={`h-full ${barColor} relative rounded-full shadow-sm`}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white/40" />
                  </motion.div>
                </div>
              </div>
            );
          })}

          {teams.length === 0 && (
            <div className="text-center py-8 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">
              Awaiting data...
            </div>
          )}
        </div>
      </div>


      {/* ---------------- PROPORTIONATE REVEAL OVERLAY ---------------- */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-8 pt-12 md:pt-16 overflow-y-auto bg-slate-200/80 backdrop-blur-3xl"
          >
            <button 
              onClick={() => setIsRevealing(false)} 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 p-3 md:p-4 rounded-full shadow-md border border-slate-200 z-50"
            >
              <X size={20} />
            </button>

            {/* Scaled-down Podium */}
            <div className="flex-1 flex items-end justify-center w-full max-w-5xl pb-16 md:pb-24 gap-4 md:gap-8 relative z-10">
              
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
                      <RevealCard team={teams[1]} rankText="Second Place" medalColor="#64748b" shadowColor="rgba(148, 163, 184, 0.4)" medalIcon="🥈" />
                      
                      <div className="w-full h-32 md:h-48 mt-[-15px] pt-8 relative flex items-center justify-center bg-white border-t-[8px] border-slate-300 shadow-xl rounded-t-2xl z-0">
                        <span className="text-5xl md:text-6xl font-black text-slate-100">II</span>
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
                      <RevealCard team={teams[0]} rankText="Grand Winner" medalColor="#d97706" shadowColor="rgba(217, 119, 6, 0.4)" medalIcon="🏆" />
                      
                      <div className="w-full h-48 md:h-64 mt-[-15px] pt-10 relative flex items-center justify-center bg-white border-t-[10px] border-amber-400 shadow-2xl rounded-t-2xl z-0">
                        <span className="text-6xl md:text-7xl font-black text-amber-50">I</span>
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
                      <RevealCard team={teams[2]} rankText="Third Place" medalColor="#c2410c" shadowColor="rgba(194, 65, 12, 0.3)" medalIcon="🥉" />
                      
                      <div className="w-full h-24 md:h-32 mt-[-15px] pt-6 relative flex items-center justify-center bg-white border-t-[8px] border-orange-500 shadow-xl rounded-t-2xl z-0">
                        <span className="text-4xl md:text-5xl font-black text-orange-50">III</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Scaled-down Reveal Controls */}
            <div className="mt-6 mb-2 relative z-50 flex gap-3 md:gap-4">
              {revealStep === 0 && (
                <button onClick={() => setRevealStep(1)} className="px-8 py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-lg transition-all hover:scale-105 active:scale-95">
                  Begin Reveal
                </button>
              )}
              {revealStep === 1 && (
                <button onClick={() => setRevealStep(2)} className="px-8 py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-lg transition-all hover:scale-105 active:scale-95">
                  Next: Runner Up
                </button>
              )}
              {revealStep === 2 && (
                <button onClick={handleRevealWinner} className="px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase shadow-[0_10px_20px_rgba(217,119,6,0.3)] transition-all hover:scale-105 active:scale-95 border border-amber-300">
                  Reveal Winner
                </button>
              )}
              {revealStep === 3 && (
                <button onClick={() => setIsRevealing(false)} className="px-8 py-3 md:py-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-xs md:text-sm font-bold tracking-[0.1em] uppercase transition-all shadow-md hover:scale-105 active:scale-95">
                  Conclude Presentation
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
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md"
                disabled={isResetting}
              >
                {isResetting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
