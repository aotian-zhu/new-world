import React from 'react';
import { motion } from 'framer-motion';
import { contentConfig } from '../config/contentConfig';

export default function Timeline() {
  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-24 text-center relative z-10">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-serif tracking-widest text-[#d4c3a3]"
        >
          {contentConfig.timeline.sectionTitle}
        </motion.h3>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* The Bloody Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#660000] to-transparent md:-translate-x-1/2 opacity-50" />

        <div className="space-y-24">
          {contentConfig.timeline.events.map((event, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center">
                
                {/* Node */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute left-6 md:left-1/2 w-4 h-4 bg-[#0a0a0a] border-2 border-[#660000] rounded-full transform -translate-x-1/2 z-20"
                />

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={cn(
                    "ml-12 md:ml-0 md:w-1/2",
                    isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:ml-auto"
                  )}
                >
                  <div className="bg-[#111] border border-[#222] p-6 hover:border-[#660000]/50 transition-colors shadow-xl">
                    <span className="text-[#660000] font-serif font-bold tracking-widest text-xl mb-2 block">
                      {event.time}
                    </span>
                    <h4 className="text-2xl font-serif text-[#d4c3a3] tracking-widest mb-4">
                      {event.title}
                    </h4>
                    <p className="text-primary-foreground/70 font-serif leading-relaxed text-sm md:text-base">
                      {event.desc}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// simple cn utility inline if not imported
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
