import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { contentConfig } from '../config/contentConfig';
import { assetsConfig } from '../config/assetsConfig';
import { cn } from '../lib/utils';
import Intro from '../components/Intro';
import InteractiveMap from '../components/InteractiveMap';
import MiniGame from '../components/MiniGame';
import Exhibition from '../components/Exhibition';

// Particles Effect Component
const Particles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#d4c3a3] rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
          }}
          animate={{
            y: window.innerHeight + 10,
            x: `calc(${Math.random() * window.innerWidth}px + ${Math.random() * 100 - 50}px)`,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  // smooth scroll setup can be added if needed, but native is fine for now

  return (
    <>
      {showIntro && <Intro onEnter={() => setShowIntro(false)} />}
      
      <div 
        ref={containerRef} 
        className={cn(
          "relative min-h-screen bg-background selection:bg-primary selection:text-foreground transition-opacity duration-1000",
          showIntro ? "opacity-0 h-screen overflow-hidden" : "opacity-100"
        )}
      >
        {/* Global Effects */}
        <div className="noise-overlay bg-noise" />
        <Particles />

        {/* Hero Section */}
        <HeroSection />

        {/* Interactive Map Section (Replaces Gallery) */}
        <InteractiveMap />

        {/* Exhibition Section */}
        <Exhibition />

        {/* Mini Game Section */}
        <MiniGame />

        {/* Finale Section */}
        <FinaleSection />
      </div>
    </>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax and Corrections */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0 overflow-hidden bg-black"
      >
        {/* Dark Overlays for Text Readability - Natural but darker */}
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none" />

        <img 
          src={assetsConfig.heroBackground} 
          alt="Manor Background" 
          className="w-full h-full object-cover opacity-80"
          style={{
            // Keep the horizon correction (rotate) and scale up to hide empty edges
            // Translate slightly upwards to hide the bottom plants
            transform: "rotate(-1.5deg) scale(1.15) translateY(-5%)",
            objectPosition: "50% 20%" // Focus on the upper building
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center"
      >
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-primary-foreground/70 tracking-[0.3em] uppercase text-sm md:text-base mb-6 font-serif"
        >
          {contentConfig.hero.date}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-black mb-6 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#e5d5b5] to-[#8a7d65] filter drop-shadow-lg"
          style={{ textShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}
        >
          {contentConfig.hero.title}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-xl md:text-2xl font-serif text-primary-foreground/90 mb-12 tracking-wider"
        >
          {contentConfig.hero.subtitle}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="w-px h-24 bg-gradient-to-b from-primary to-transparent mx-auto mb-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-base md:text-lg text-primary-foreground/70 max-w-2xl leading-relaxed font-serif"
        >
          {contentConfig.hero.description}
        </motion.p>
      </motion.div>
    </section>
  );
}

function StorySection() {
  return null;
}

function GallerySection() {
  return null;
}

function FinaleSection() {
  return (
    <section className="relative py-32 md:py-48 px-6 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="max-w-3xl mx-auto space-y-12"
      >
        <h3 className="text-4xl md:text-6xl font-serif tracking-widest text-[#d4c3a3]">
          {contentConfig.finale.title}
        </h3>
        
        <p className="text-xl md:text-2xl text-primary-foreground/70 leading-loose font-serif">
          {contentConfig.finale.message}
        </p>

        {/* NPC 送别插图 */}
        <div className="relative aspect-[21/9] w-full max-w-4xl mx-auto my-16 border border-[#333] shadow-2xl overflow-hidden group">
          <img 
            src="/ending.jpg" 
            alt="NPC 挥手送别" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[10s]"
            style={{ objectPosition: '50% 100%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-[#d4c3a3] font-serif tracking-widest text-lg italic opacity-80">
              “时光列车驶离1945，我们，后会有期。”
            </p>
          </div>
        </div>

        <div className="pt-16 border-t border-border/50 max-w-2xl mx-auto space-y-6">
          <p className="text-base md:text-lg text-primary-foreground/65 leading-loose font-serif">
            {contentConfig.finale.epilogue}
          </p>
          <p className="text-sm md:text-base text-[#d4c3a3]/80 tracking-[0.2em] font-serif italic">
            {contentConfig.finale.signature}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
