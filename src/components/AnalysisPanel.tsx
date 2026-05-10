"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Scale, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  MessageSquare,
  Edit3,
  Gavel,
  Lock,
  Clock,
  Briefcase,
  Zap
} from "lucide-react";

import { AnalysisResponse } from "@/lib/schema";
import { PushbackModal } from "./PushbackModal";
import { RiskHeatmap } from "./RiskHeatmap";
import { PowerBalance } from "./PowerBalance";
import { useMotionValue, useTransform, useSpring } from "framer-motion";

interface AnalysisPanelProps {
  data: AnalysisResponse;
}

// Quantum Card for Layered 3D Depth
const QuantumCard = ({ children, className, depth = 30 }: { children: React.ReactNode, className?: string, depth?: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Shared State Hook for components to stay in sync
export function useAnalysisState() {
  const [isEli5, setIsEli5] = useState(false);
  const [activeRedline, setActiveRedline] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, content: string}>({
    isOpen: false,
    title: "",
    content: ""
  });

  const openPushback = (title: string, content: string) => {
    setModalState({ isOpen: true, title, content });
  };

  const toggleRedline = (section: string) => {
    setActiveRedline(prev => prev === section ? null : section);
  };

  return {
    isEli5,
    setIsEli5,
    activeRedline,
    setActiveRedline,
    modalState,
    setModalState,
    openPushback,
    toggleRedline
  };
}

const getPillarIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('liability') || t.includes('indemnity')) return <Scale className="w-5 h-5" />;
  if (t.includes('termination') || t.includes('exit')) return <LogOut className="w-5 h-5" />;
  if (t.includes('payment') || t.includes('fee') || t.includes('cost')) return <CreditCard className="w-5 h-5" />;
  if (t.includes('confidential') || t.includes('privacy') || t.includes('security') || t.includes('data')) return <Lock className="w-5 h-5" />;
  if (t.includes('duration') || t.includes('time') || t.includes('term')) return <Clock className="w-5 h-5" />;
  if (t.includes('ip') || t.includes('intellectual') || t.includes('ownership')) return <Zap className="w-5 h-5" />;
  if (t.includes('employment') || t.includes('service') || t.includes('work')) return <Briefcase className="w-5 h-5" />;
  return <Gavel className="w-5 h-5" />;
};
const RedlineView = ({ content }: { content: string }) => {
  const parts = content.split(/(~~.*?~~|\*\*.*?\*\*)/g);
  return (
    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 font-mono text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("~~")) {
          return <span key={i} className="text-danger line-through decoration-danger/50 bg-danger/10 px-1 rounded">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith("**")) {
          return <span key={i} className="text-safe font-bold bg-safe/10 px-1 rounded">{part.slice(2, -2)}</span>;
        }
        return <span key={i} className="text-white/60">{part}</span>;
      })}
    </div>
  );
};

export function AnalysisOverview({ data, state }: { data: AnalysisResponse, state: ReturnType<typeof useAnalysisState> }) {
  const { isEli5, setIsEli5 } = state;

  return (
    <div className="w-full flex flex-col gap-6 perspective-container">
      {/* Top Header & ELI5 Toggle */}
      <motion.div 
        initial={{ opacity: 0, z: -100, rotateX: 20 }}
        animate={{ opacity: 1, z: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-between items-end"
      >
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-alert mb-2">Analysis Complete</div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-semibold tracking-tight font-playfair italic capitalize">{data.documentType}</h2>
            {data.confidenceScore && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-full bg-safe/10 border border-safe/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-safe" />
                <span className="text-[10px] font-bold text-safe uppercase tracking-tighter">{data.confidenceScore}% Confidence</span>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setIsEli5(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${!isEli5 ? 'bg-white text-charcoal shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setIsEli5(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${isEli5 ? 'bg-alert text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            Explain Like I'm 5
          </button>
        </div>
      </motion.div>

      {/* Heatmap Card */}
      <QuantumCard>
        <motion.div 
          initial={{ opacity: 0, z: -200, rotateX: 10 }}
          animate={{ opacity: 1, z: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="rounded-3xl p-6 glass-card border-white/5 shadow-2xl overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div style={{ transform: "translateZ(30px)" }}>
            <RiskHeatmap items={data.heatmap} />
          </div>
        </motion.div>
      </QuantumCard>

      {/* Power Balance Card */}
      {data.powerBalance && (
        <QuantumCard>
          <motion.div 
            initial={{ opacity: 0, z: -200, rotateX: 10 }}
            animate={{ opacity: 1, z: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="rounded-3xl p-8 glass-card border-white/5 shadow-2xl relative overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5" style={{ transform: "translateZ(10px)" }}>
              <Gavel className="w-32 h-32" />
            </div>
            <div style={{ transform: "translateZ(40px)" }}>
              <PowerBalance {...data.powerBalance} />
            </div>
          </motion.div>
        </QuantumCard>
      )}
    </div>
  );
}

export function AnalysisDetails({ data, state }: { data: AnalysisResponse, state: ReturnType<typeof useAnalysisState> }) {
  const { isEli5, activeRedline, openPushback, toggleRedline, modalState, setModalState } = state;

  return (
    <div className="w-full flex flex-col gap-10 perspective-container">
      {/* Vulnerability Score - Hero Card */}
      <QuantumCard>
        <motion.div 
          className="rounded-[40px] p-10 glass-card flex flex-col justify-between relative overflow-hidden group shadow-2xl"
          initial={{ opacity: 0, z: -300, rotateX: 15 }}
          whileInView={{ opacity: 1, z: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={`absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] -mr-48 -mt-48 transition-colors duration-1000 ${data.overallScore < 50 ? 'bg-danger/10' : data.overallScore < 75 ? 'bg-caution/10' : 'bg-safe/10'}`} />
          
          <div className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
            <h3 className="text-xs font-bold text-white/30 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]" style={{ transform: "translateZ(20px)" }}>
              <ShieldAlert className="w-4 h-4 text-alert" /> Security Integrity Index
            </h3>
            <div className="flex flex-col md:flex-row md:items-center gap-12" style={{ transform: "translateZ(50px)" }}>
              <div className="flex items-baseline gap-3">
                <span className={`text-[120px] leading-none font-bold tracking-tightest font-playfair italic ${data.overallScore < 50 ? 'text-danger' : data.overallScore < 75 ? 'text-caution' : 'text-safe'}`}>
                  {data.overallScore}
                </span>
                <span className="text-5xl text-white/10">/100</span>
              </div>
              
              <div className="flex-1 w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.overallScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${data.overallScore < 50 ? 'bg-danger' : data.overallScore < 75 ? 'bg-caution' : 'bg-safe'} shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 mb-10" style={{ transform: "translateZ(30px)" }}>
              <div className={`w-3 h-3 rounded-full animate-ping ${data.riskLevel === 'High' ? 'bg-danger' : data.riskLevel === 'Moderate' ? 'bg-caution' : 'bg-safe'}`} />
              <p className={`text-3xl font-medium tracking-tight ${data.riskLevel === 'High' ? 'text-danger' : data.riskLevel === 'Moderate' ? 'text-caution' : 'text-safe'}`}>
                {data.riskLevel} Threat Level Identified
              </p>
            </div>
            
            <p className="text-3xl text-white/80 leading-relaxed max-w-5xl font-light italic" style={{ transform: "translateZ(40px)" }}>
              "{data.summary}"
            </p>
          </div>
        </motion.div>
      </QuantumCard>

      {/* Bento Grid (Dynamic Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-container">
        {data.keyPillars.map((pillar, index) => (
          <QuantumCard 
            key={pillar.title}
            className={`${index === 0 ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}
          >
            <motion.div 
              initial={{ opacity: 0, z: -200, rotateY: 20 }}
              whileInView={{ opacity: 1, z: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 1 }}
              className={`h-full rounded-[40px] p-10 glass-card shadow-xl transition-all duration-500 hover:border-white/10 ${pillar.status === 'Unbalanced' ? 'bg-gradient-to-br from-white/[0.03] to-danger/[0.03] border-danger/20' : ''}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex items-start justify-between mb-10" style={{ transform: "translateZ(40px)" }}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${pillar.status === 'Unbalanced' ? 'bg-danger/10 text-danger shadow-[0_0_15px_rgba(255,76,76,0.1)]' : 'bg-white/5 text-white/70'}`}>
                    {getPillarIcon(pillar.title)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-paper">{pillar.title}</h3>
                    <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mt-1">Strategic Audit 0{index + 1}</div>
                  </div>
                </div>
                <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${pillar.status === 'Unbalanced' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                  {pillar.status}
                </span>
              </div>
              
              <div className="space-y-6 mb-10 min-h-[80px]" style={{ transform: "translateZ(30px)" }}>
                <AnimatePresence mode="wait">
                  {activeRedline === pillar.title && pillar.redline ? (
                    <motion.div
                      key="redline"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-safe mb-3 flex items-center gap-2">
                        <Edit3 className="w-3 h-3" /> Guardian Redline Recommendation
                      </div>
                      <RedlineView content={pillar.redline} />
                    </motion.div>
                  ) : (
                    <motion.p 
                      key={isEli5 ? 'eli5' : 'standard'}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-white/90 leading-relaxed text-[19px] font-light"
                    >
                      {isEli5 ? pillar.eli5 : pillar.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4" style={{ transform: "translateZ(50px)" }}>
                <button 
                  onClick={() => openPushback(pillar.title, pillar.pushback)}
                  className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
                >
                  <MessageSquare className="w-4 h-4" /> Draft Pushback
                </button>
                {pillar.redline && (
                  <button 
                    onClick={() => toggleRedline(pillar.title)}
                    className={`px-6 py-3 rounded-full border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${activeRedline === pillar.title ? 'bg-safe/20 border-safe/40 text-safe' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                  >
                    <Edit3 className="w-4 h-4" /> {activeRedline === pillar.title ? 'Hide Redline' : 'Suggest Redline'}
                  </button>
                )}
              </div>
            </motion.div>
          </QuantumCard>
        ))}

        {/* Missing Clauses - Silent Risks */}
        {data.missingClauses && data.missingClauses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 rounded-[50px] p-12 glass-card border-alert/20 bg-gradient-to-br from-white/[0.03] to-alert/[0.02] mt-8"
          >
            <h3 className="text-3xl font-medium mb-10 flex items-center gap-4 font-playfair italic">
              <ShieldAlert className="w-8 h-8 text-alert" /> Silent Risks (Critical Omissions)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {data.missingClauses.map((mc, idx) => (
                <div key={idx} className="p-10 rounded-[40px] bg-white/5 border border-white/5 hover:border-alert/20 transition-all group">
                  <h4 className="text-2xl text-paper font-semibold mb-4 group-hover:text-alert transition-colors">{mc.clause}</h4>
                  <p className="text-white/70 mb-8 leading-relaxed text-lg font-light">{mc.description}</p>
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-alert mb-3">Guardian Risk Assessment</p>
                    <p className="text-base text-white/40 italic font-light leading-relaxed">"{mc.whyItMatters}"</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <PushbackModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState(prev => ({...prev, isOpen: false}))}
        title={modalState.title}
        pushbackContent={modalState.content}
      />
    </div>
  );
}

// Default export for backward compatibility if needed, but we'll use separate exports in page.tsx
export function AnalysisPanel({ data }: AnalysisPanelProps) {
  const state = useAnalysisState();
  return (
    <div className="flex flex-col gap-12">
      <AnalysisOverview data={data} state={state} />
      <AnalysisDetails data={data} state={state} />
    </div>
  );
}
