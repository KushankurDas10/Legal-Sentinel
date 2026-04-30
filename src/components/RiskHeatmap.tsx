"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface HeatmapItem {
  section: string;
  risk: "safe" | "caution" | "danger";
}

interface RiskHeatmapProps {
  items: HeatmapItem[];
}

export function RiskHeatmap({ items }: RiskHeatmapProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "safe": return "bg-safe";
      case "caution": return "bg-caution";
      case "danger": return "bg-danger";
      default: return "bg-white/10";
    }
  };

  const getRiskGradient = (risk: string) => {
    switch (risk) {
      case "safe": return "from-safe/80 to-safe";
      case "caution": return "from-caution/80 to-caution";
      case "danger": return "from-danger/80 to-danger";
      default: return "from-white/10 to-white/20";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-alert" /> Structural Risk Audit
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-safe">
            <div className="w-2 h-2 rounded-full bg-safe" /> Safe
          </div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-caution">
            <div className="w-2 h-2 rounded-full bg-caution" /> Caution
          </div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-danger">
            <div className="w-2 h-2 rounded-full bg-danger" /> Danger
          </div>
        </div>
      </div>

      <div className="flex h-3 w-full gap-1.5 overflow-hidden rounded-full p-0.5 bg-white/5 border border-white/10">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`h-full relative group rounded-full bg-gradient-to-r ${getRiskGradient(item.risk)} cursor-help shadow-lg`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
              <div className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                <p className="text-xs font-bold text-white mb-0.5">{item.section}</p>
                <p className={`text-[10px] font-medium uppercase tracking-widest ${item.risk === 'safe' ? 'text-safe' : item.risk === 'caution' ? 'text-caution' : 'text-danger'}`}>
                  {item.risk}
                </p>
              </div>
              <div className="w-2 h-2 bg-[#1A1A1A] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 flex justify-between text-[10px] text-white/30 font-medium uppercase tracking-tighter">
        <span>Start of Document</span>
        <span>End of Analysis</span>
      </div>
    </div>
  );
}
