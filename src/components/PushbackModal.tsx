"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Send } from "lucide-react";

interface PushbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pushbackContent: string;
}

export function PushbackModal({ isOpen, onClose, title, pushbackContent }: PushbackModalProps) {
  const [tone, setTone] = React.useState<"polite" | "firm">("polite");
  
  const getToneAdjustedContent = (content: string) => {
    if (tone === "firm") {
      return content.replace(/I would like to suggest/g, "I require").replace(/Could we/g, "We must");
    }
    return content;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getToneAdjustedContent(pushbackContent));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-medium mb-2">Draft Pushback</h3>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/60 text-sm">
                AI-generated response for <span className="text-white font-medium">{title}</span>.
              </p>
              
              <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                <button 
                  onClick={() => setTone("polite")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${tone === 'polite' ? 'bg-white text-charcoal' : 'text-white/40'}`}
                >
                  Polite
                </button>
                <button 
                  onClick={() => setTone("firm")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${tone === 'firm' ? 'bg-alert text-white' : 'text-white/40'}`}
                >
                  Firm
                </button>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap font-serif italic text-[15px]">
                "{getToneAdjustedContent(pushbackContent)}"
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={handleCopy}
                className="px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Copy to Clipboard
              </button>
              <button 
                onClick={() => window.open(`mailto:?subject=Contract Discussion: ${title}&body=${encodeURIComponent("Dear Client,\n\nI hope you're well.\n\n" + getToneAdjustedContent(pushbackContent) + "\n\nBest regards,\n[Your Name]")}`)}
                className="px-5 py-2.5 rounded-full bg-paper text-charcoal hover:bg-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" /> Open in Email
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
