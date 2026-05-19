import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { contentConfig } from '../config/contentConfig';
import { assetsConfig } from '../config/assetsConfig';
import { cn } from '../lib/utils';

// Typewriter Component for realistic telegram typing effect
const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80); // Adjust typing speed here
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="font-serif tracking-wider leading-relaxed text-[#d4c3a3]">
      {displayed}
      <span className="animate-pulse inline-block w-2 h-4 bg-[#660000] ml-1 align-middle" />
    </span>
  );
};

export default function MiniGame() {
  const ui = contentConfig.miniGame.gameUI;
  
  // Create 8 cards (4 pairs) and shuffle them
  const initializeCards = () => {
    return [...contentConfig.miniGame.cards, ...contentConfig.miniGame.cards]
      .map((card, index) => ({ ...card, uniqueId: index }))
      .sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(initializeCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [activeCharacter, setActiveCharacter] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  const isVictory = matchedIds.length === contentConfig.miniGame.cards.length;

  const handleCardClick = (index: number) => {
    // Prevent clicking if board is locked, card is already flipped, or already matched
    if (isLocked || flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].id === cards[secondIndex].id) {
        // Match found
        setMatchedIds(prev => [...prev, cards[firstIndex].id]);
        setActiveCharacter(cards[firstIndex]);
        setFlippedIndices([]);
        setIsLocked(false);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const restartGame = () => {
    setCards(initializeCards());
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setActiveCharacter(null);
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-b border-border">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
        <div className="inline-flex items-center justify-center gap-4 mb-6">
          <span className="w-12 h-px bg-primary" />
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif tracking-widest text-[#d4c3a3]"
          >
            {contentConfig.miniGame.sectionTitle}
          </motion.h3>
          <span className="w-12 h-px bg-primary" />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-primary-foreground/60 max-w-2xl mx-auto font-serif text-lg"
        >
          {contentConfig.miniGame.description}
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left: Memory Grid */}
          <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.id);
              const isMatched = matchedIds.includes(card.id);

              return (
                <motion.div
                  key={card.uniqueId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={cn(
                    "relative aspect-[3/4] cursor-pointer group perspective-1000",
                    isMatched ? "opacity-40 pointer-events-none" : ""
                  )}
                  onClick={() => handleCardClick(idx)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d transition-transform duration-500 ease-out"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                  >
                    {/* Front of card (Back cover) */}
                    <div className="absolute inset-0 backface-hidden bg-[#1a1a1a] border border-[#333] flex flex-col items-center justify-center p-2 sm:p-4 shadow-xl group-hover:border-[#660000] transition-colors">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-[#660000] flex items-center justify-center mb-2">
                        <span className="text-[#660000] font-serif text-xl sm:text-2xl font-black">?</span>
                      </div>
                      <h4 className="text-[#d4c3a3] font-serif text-[10px] sm:text-xs tracking-widest text-center hidden sm:block">绝密档案</h4>
                      
                      {/* Corner decorations */}
                      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#444]" />
                      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#444]" />
                      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#444]" />
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#444]" />
                    </div>

                    {/* Back of card (Character Face) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#e5d5b5] border-2 border-[#d4c3a3] flex flex-col items-center p-1 sm:p-2 shadow-xl">
                      <div className="w-full h-full bg-[#1a1a1a] overflow-hidden border border-[#8a7d65]">
                        <img 
                          src={assetsConfig.qVersionCharacters[card.id - 1]} 
                          alt={card.character}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Telegraph Terminal */}
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <div className="bg-[#111] border border-[#333] p-6 h-full min-h-[350px] flex flex-col relative shadow-2xl">
              {/* Top bar */}
              <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-6">
                <div className="flex gap-4 text-primary-foreground/60 text-xs sm:text-sm font-serif tracking-widest">
                  <span>{ui.moves}: <span className="text-[#d4c3a3]">{moves}</span></span>
                  <span>{ui.matches}: <span className="text-[#d4c3a3]">{matchedIds.length}/{contentConfig.miniGame.cards.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-primary-foreground/30 tracking-widest">SIGNAL</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                    isVictory ? "bg-green-600 text-green-600" : "bg-[#660000] text-[#660000] animate-pulse"
                  )} />
                </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 flex flex-col justify-center">
                {isVictory ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                  >
                    <h4 className="text-2xl sm:text-3xl text-[#d4c3a3] font-serif tracking-widest">{ui.victoryTitle}</h4>
                    <p className="text-primary-foreground/80 font-serif leading-relaxed">{ui.victoryMessage}</p>
                    <button 
                      onClick={restartGame} 
                      className="px-6 py-3 border border-[#660000] text-[#660000] hover:bg-[#660000] hover:text-[#d4c3a3] transition-colors font-serif tracking-widest text-sm uppercase"
                    >
                      {ui.restart}
                    </button>
                  </motion.div>
                ) : activeCharacter ? (
                  <motion.div 
                    key={activeCharacter.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 border-b border-[#222] pb-4">
                      <img 
                        src={assetsConfig.qVersionCharacters[activeCharacter.id - 1]} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-[#8a7d65] object-cover" 
                        alt={activeCharacter.character}
                      />
                      <div>
                        <p className="text-[10px] text-primary-foreground/40 uppercase tracking-[0.2em] mb-1">Signal Decoded</p>
                        <h4 className="text-lg sm:text-xl text-[#d4c3a3] font-serif tracking-widest">{activeCharacter.character}</h4>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 sm:p-6 border-l-2 border-[#660000] min-h-[120px]">
                      <TypewriterText text={activeCharacter.quote} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-primary-foreground/40 font-serif tracking-widest flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-[#333] rounded-full" />
                      <div className="absolute inset-0 border-t-2 border-[#660000] rounded-full animate-spin" />
                      <div className="w-2 h-2 bg-[#660000] rounded-full animate-pulse" />
                    </div>
                    <p className="animate-pulse">{ui.waiting}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
