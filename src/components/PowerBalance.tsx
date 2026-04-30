"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scale, User, Building2, Gavel } from "lucide-react";

interface PowerBalanceProps {
  partyA: string;
  partyB: string;
  rightsA: number;
  rightsB: number;
  obligationsA: number;
  obligationsB: number;
  balanceScore: number; // -100 to 100
}

export function PowerBalance({ 
  partyA, 
  partyB, 
  rightsA, 
  rightsB, 
  obligationsA, 
  obligationsB,
  balanceScore 
}: PowerBalanceProps) {
  // Calculate rotation based on balanceScore
  // 0 is balanced, negative is Party A favored, positive is Party B favored
  const rotation = (balanceScore / 100) * 15;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
          <Gavel className="w-3.5 h-3.5 text-alert" /> Equilibrium Analysis
        </h3>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
          {Math.abs(balanceScore) < 10 ? "Balanced" : balanceScore < 0 ? `${partyA} Favored` : `${partyB} Favored`}
        </div>
      </div>

      <div className="relative h-64 flex flex-col items-center justify-center overflow-hidden">
        {/* The Scale Base */}
        <div className="absolute bottom-4 w-32 h-2 bg-white/5 rounded-full" />
        <div className="absolute bottom-4 w-1 h-32 bg-gradient-to-t from-white/10 to-transparent" />

        {/* The Scale Beam */}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="relative w-full max-w-md flex items-center justify-between px-12 z-10"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Party A Side */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              animate={{ y: rotation * 2 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-2xl"
            >
              <User className="w-6 h-6 text-paper" />
              <div className="text-[8px] font-bold uppercase text-white/40">{partyA.substring(0, 8)}...</div>
            </motion.div>
            <div className="mt-4 text-center">
              <div className="text-xl font-bold text-paper">{rightsA} <span className="text-[10px] text-white/30">Rights</span></div>
              <div className="text-sm text-white/40">{obligationsA} <span className="text-[10px] text-white/20">Obligations</span></div>
            </div>
          </div>

          <div className="text-white/10">
            <Scale className="w-12 h-12" />
          </div>

          {/* Party B Side */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              animate={{ y: -rotation * 2 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-2xl"
            >
              <Building2 className="w-6 h-6 text-alert" />
              <div className="text-[8px] font-bold uppercase text-white/40">{partyB.substring(0, 8)}...</div>
            </motion.div>
            <div className="mt-4 text-center">
              <div className="text-xl font-bold text-paper">{rightsB} <span className="text-[10px] text-white/30">Rights</span></div>
              <div className="text-sm text-white/40">{obligationsB} <span className="text-[10px] text-white/20">Obligations</span></div>
            </div>
          </div>
        </motion.div>

        {/* Decorative Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0], 
                scale: [0, 1, 0],
                x: Math.random() * 400 - 200,
                y: Math.random() * 200 - 100 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              className="absolute left-1/2 top-1/2 w-1 h-1 bg-white/20 rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <p className="text-[11px] text-white/50 leading-relaxed text-center italic">
          The power balance is calculated by analyzing enforceable rights versus mandatory obligations assigned to each entity within the contractual framework.
        </p>
      </div>
    </div>
  );
}
