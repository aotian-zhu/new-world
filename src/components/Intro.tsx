import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { contentConfig } from '../config/contentConfig';
import { assetsConfig } from '../config/assetsConfig';

interface IntroProps {
  onEnter: () => void;
}

export default function Intro({ onEnter }: IntroProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle subtle parallax based on mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 2500); // slightly longer fade out for a more dramatic exit
  };

  return (
    <AnimatePresence>
      {!isEntering && (
        <motion.div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          exit={{ 
            opacity: 0, 
            scale: 1.15, 
            filter: "blur(15px) brightness(0.5)",
          }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dynamic Spotlight Effect following mouse */}
          <motion.div 
            className="absolute w-[800px] h-[800px] bg-[#d4c3a3]/10 rounded-full blur-[120px] pointer-events-none"
            animate={{
              x: mousePosition.x * 100,
              y: mousePosition.y * 100,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />

          {/* Floating Particles in Background */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#d4c3a3] rounded-full opacity-30"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: Math.random() * 2,
                }}
                animate={{
                  y: [null, Math.random() * -200],
                  opacity: [0.1, 0.6, 0.1],
                }}
                transition={{
                  duration: Math.random() * 4 + 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Poster Container with Parallax */}
          <motion.div
            initial={{ y: 80, opacity: 0, rotateX: 30, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              rotateX: mousePosition.y * -10, // Mouse Y tilts X axis
              rotateY: mousePosition.x * 10,  // Mouse X tilts Y axis
              scale: 1 
            }}
            transition={{ 
              y: { duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
              opacity: { duration: 1.5, delay: 0.2 },
              scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
              rotateX: { type: "spring", stiffness: 75, damping: 15 },
              rotateY: { type: "spring", stiffness: 75, damping: 15 }
            }}
            className="relative w-[85%] max-w-[420px] aspect-[3/4] cursor-pointer group perspective-1000 z-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleEnter}
          >
            {/* The Poster Image */}
            <motion.div 
              className="absolute inset-0 shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden rounded-sm bg-[#0a0a0a] border border-[#333]"
              animate={{ 
                scale: isHovered ? 1.03 : 1,
                boxShadow: isHovered 
                  ? "0 40px 80px -10px rgba(212, 195, 163, 0.2), 0 0 40px rgba(212, 195, 163, 0.1)" 
                  : "0 30px 60px -12px rgba(0, 0, 0, 0.9)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <img 
                src={assetsConfig.introPoster} 
                alt="1945 Poster Background" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5s] ease-out"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
              />
              
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            </motion.div>

            {/* Glowing Edge on Hover */}
            <motion.div 
              className="absolute inset-0 rounded-sm border border-[#d4c3a3]/40 pointer-events-none"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
            className="mt-16 text-center z-10"
          >
            <button 
              onClick={handleEnter}
              className="relative overflow-hidden text-[#d4c3a3] font-serif tracking-[0.4em] uppercase px-10 py-4 border border-[#d4c3a3]/30 group transition-all duration-500 hover:border-[#d4c3a3] hover:shadow-[0_0_30px_rgba(212,195,163,0.2)]"
            >
              <span className="relative z-10 drop-shadow-md">{contentConfig.intro.buttonText}</span>
              <div className="absolute inset-0 bg-[#d4c3a3]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
