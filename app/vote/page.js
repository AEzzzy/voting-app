'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChefHat, Presentation, Cpu, Maximize } from 'lucide-react';

const INITIAL_TEAMS = [
  { 
    id: 'engineers', 
    name: 'المهندسون الحاذقون', 
    icon: Building2, 
    color: 'bg-sky-950/90', 
    hover: 'hover:bg-sky-900',
    borderColor: 'border-sky-400/30',
    glowColor: 'rgba(56, 189, 248, 0.4)'
  },
  { 
    id: 'chefs', 
    name: 'الطباخون الماهرون', 
    icon: ChefHat, 
    color: 'bg-rose-950/90', 
    hover: 'hover:bg-rose-900',
    borderColor: 'border-rose-400/30',
    glowColor: 'rgba(251, 113, 133, 0.4)'
  },
  { 
    id: 'teachers', 
    name: 'المعلمون المتعلمون', 
    icon: Presentation, 
    color: 'bg-emerald-950/90', 
    hover: 'hover:bg-emerald-900',
    borderColor: 'border-emerald-400/30',
    glowColor: 'rgba(52, 211, 153, 0.4)'
  },
  { 
    id: 'technicians', 
    name: 'التقنيون المتطورون', 
    icon: Cpu, 
    color: 'bg-violet-950/90', 
    hover: 'hover:bg-violet-900',
    borderColor: 'border-violet-400/30',
    glowColor: 'rgba(167, 139, 250, 0.4)'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.5 } }
};

export default function VotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleVote = (teamId) => {
    if (isSubmitting || showThankYou) return;
    
    setIsSubmitting(true);
    setShowThankYou(true);

    fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    }).catch(err => console.error("Vote error:", err));
    
    setTimeout(() => {
      setShowThankYou(false);
      setIsSubmitting(false);
    }, 600); // Extremely fast reset (600ms)
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col items-center justify-center bg-black">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-[url('/bg-clean.jpg')] z-0 bg-cover bg-center bg-no-repeat" 
      />
      
      {/* Container perfectly centered in the lower white space */}
      <div 
        className="absolute left-1/2 z-10 w-full max-w-xl px-4 flex flex-col items-center justify-center"
        style={{ top: '60%', transform: 'translate(-50%, -50%)' }}
      >
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div 
              key="thankyou"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full aspect-video flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden relative"
            >
              {/* Shimmer Effect inside the Thank You card - sped up */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              <div className="text-5xl md:text-6xl lg:text-7xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                ✨
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white text-shadow drop-shadow-2xl text-center z-10">
                شكراً جزيلاً
              </h2>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              className="w-full grid grid-cols-2 gap-4 md:gap-5"
            >
              {INITIAL_TEAMS.map((team) => {
                const Icon = team.icon;
                return (
                  <motion.button
                    key={team.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: `0px 15px 35px ${team.glowColor}`
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(team.id)}
                    disabled={isSubmitting}
                    className={`
                      ${team.color} ${team.borderColor}
                      relative overflow-hidden rounded-2xl
                      border-2 backdrop-blur-sm
                      aspect-[3/2] flex flex-col items-center justify-center gap-3
                      disabled:opacity-50 disabled:cursor-not-allowed
                      group
                    `}
                  >
                    {/* Background Glow that appears on hover */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    
                    <Icon className="text-white/90 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                    <span className="text-xl md:text-2xl lg:text-3xl font-normal text-white drop-shadow-lg text-center px-2 relative z-10" dir="rtl" style={{ lineHeight: '1.2' }}>
                      {team.name}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Screen Toggle Button */}
      <button 
        onClick={toggleFullScreen}
        className="absolute bottom-6 right-6 z-50 p-4 bg-black/40 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95"
        aria-label="Toggle Full Screen"
      >
        <Maximize size={24} />
      </button>

    </div>
  );
}
