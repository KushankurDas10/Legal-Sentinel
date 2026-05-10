"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { User, Building2, Gavel, Zap } from "lucide-react";

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
  // Calculate physics-based visualization values
  const tilt = (balanceScore / 100) * 20;
  const sizeA = 40 + (rightsA / (rightsA + rightsB || 1)) * 40;
  const sizeB = 40 + (rightsB / (rightsA + rightsB || 1)) * 40;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
          <Gavel className="w-3.5 h-3.5 text-alert" /> Power Equilibrium
        </h3>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider backdrop-blur-sm">
          {Math.abs(balanceScore) < 10 ? "Optimal Balance" : balanceScore < 0 ? `${partyA} Dominant` : `${partyB} Dominant`}
        </div>
      </div>

      <div className="relative h-80 flex items-center justify-center perspective-container overflow-visible">
        {/* Central Hub */}
        <div className="absolute z-20 w-12 h-12 rounded-full bg-charcoal border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <Zap className="w-5 h-5 text-alert animate-pulse" />
          
          {/* Orbital Data Rings */}
          <motion.div 
            animate={{ rotate: 360, rotateX: 70 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-48 border border-alert/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360, rotateX: 60 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 border border-white/5 rounded-full"
          />
        </div>

        {/* The 3D Bar-Bell Assembly */}
        <motion.div
          animate={{ rotateZ: tilt, rotateY: [0, 5, 0] }}
          transition={{ 
            rotateZ: { type: "spring", stiffness: 40, damping: 15 },
            rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full max-w-sm h-1 flex items-center justify-center"
        >
          {/* Connecting Energy Beam */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute w-full h-[8px] bg-alert/5 blur-md" />

          {/* Side A: Sphere & Label */}
          <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              style={{ width: sizeA, height: sizeA }}
              className="rounded-full bg-white/5 border border-white/20 relative flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full" />
              <User className="w-1/2 h-1/2 text-white/40" />
              
              {/* Floating Stat Card */}
              <div 
                className="absolute -top-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap"
                style={{ transform: "translateZ(30px)" }}
              >
                <span className="text-xs font-bold text-white">{rightsA}</span>
                <span className="text-[8px] text-white/30 uppercase ml-1">Rights</span>
              </div>
            </motion.div>
          </div>

          {/* Side B: Sphere & Label */}
          <div className="absolute right-0 translate-x-1/2 flex flex-col items-center" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              style={{ width: sizeB, height: sizeB }}
              className="rounded-full bg-alert/5 border border-alert/20 relative flex items-center justify-center shadow-[0_0_40px_rgba(255,76,76,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-alert/20 to-transparent rounded-full" />
              <Building2 className="w-1/2 h-1/2 text-alert/60" />

              {/* Floating Stat Card */}
              <div 
                className="absolute -top-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap"
                style={{ transform: "translateZ(30px)" }}
              >
                <span className="text-xs font-bold text-alert">{rightsB}</span>
                <span className="text-[8px] text-white/30 uppercase ml-1">Rights</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Party Names (Fixed Position) */}
        <div className="absolute bottom-0 w-full flex justify-between px-4">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{partyA}</div>
            <div className="text-[8px] text-white/30">{obligationsA} Obligations</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{partyB}</div>
            <div className="text-[8px] text-white/30">{obligationsB} Obligations</div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <p className="text-[10px] text-white/30 leading-relaxed text-center italic uppercase tracking-tighter">
          Analysis shows a {Math.abs(balanceScore)}% deviation from neutral equilibrium favoring {balanceScore < 0 ? partyA : partyB}.
        </p>
      </div>
    </div>
  );
}
