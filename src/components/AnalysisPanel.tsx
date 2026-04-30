"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Scale, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  Edit3,
  Gavel,
  Lock,
  Clock,
  Briefcase,
  HelpCircle,
  Zap
} from "lucide-react";

import { AnalysisResponse } from "@/lib/schema";
import { PushbackModal } from "./PushbackModal";
import { RiskHeatmap } from "./RiskHeatmap";
import { PowerBalance } from "./PowerBalance";
import { AnimatePresence } from "framer-motion";

interface AnalysisPanelProps {
  data: AnalysisResponse;
}

export function AnalysisPanel({ data }: AnalysisPanelProps) {
  const [isEli5, setIsEli5] = useState(false);
  const [activeRedline, setActiveRedline] = useState<string | null>(null);
  
  // Dynamic Icon Selector
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

  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, content: string}>({
    isOpen: false,
    title: "",
    content: ""
  });

  const openPushback = (title: string, content: string) => {
    setModalState({ isOpen: true, title, content });
  };

  const toggleRedline = (section: string) => {
    setActiveRedline(activeRedline === section ? null : section);
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

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        
        {/* Top Header & ELI5 Toggle */}
        <div className="flex justify-between items-end">
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
        </div>

        {/* Heatmap Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 glass-card border-white/5 shadow-2xl"
        >
          <RiskHeatmap items={data.heatmap} />
        </motion.div>

        {/* Power Balance Card */}
        {data.powerBalance && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 glass-card border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Gavel className="w-32 h-32" />
            </div>
            <PowerBalance {...data.powerBalance} />
          </motion.div>
        )}

        {/* Vulnerability Score - Hero Card */}
        <motion.div 
          className="rounded-[40px] p-10 glass-card flex flex-col justify-between relative overflow-hidden group shadow-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] -mr-32 -mt-32 transition-colors duration-1000 ${data.overallScore < 50 ? 'bg-danger/10' : data.overallScore < 75 ? 'bg-caution/10' : 'bg-safe/10'}`} />
          
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-white/30 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
              <ShieldAlert className="w-4 h-4 text-alert" /> Security Integrity Index
            </h3>
            <div className="flex items-center gap-12">
              <div className="flex items-baseline gap-3">
                <span className={`text-9xl font-bold tracking-tightest font-playfair italic ${data.overallScore < 50 ? 'text-danger' : data.overallScore < 75 ? 'text-caution' : 'text-safe'}`}>
                  {data.overallScore}
                </span>
                <span className="text-4xl text-white/10">/100</span>
              </div>
              
              <div className="flex-1 max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.overallScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${data.overallScore < 50 ? 'bg-danger' : data.overallScore < 75 ? 'bg-caution' : 'bg-safe'} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 mb-8">
              <div className={`w-2.5 h-2.5 rounded-full animate-ping ${data.riskLevel === 'High' ? 'bg-danger' : data.riskLevel === 'Moderate' ? 'bg-caution' : 'bg-safe'}`} />
              <p className={`text-2xl font-medium tracking-tight ${data.riskLevel === 'High' ? 'text-danger' : data.riskLevel === 'Moderate' ? 'text-caution' : 'text-safe'}`}>
                {data.riskLevel} Threat Level
              </p>
            </div>
            
            <p className="text-xl text-white/70 leading-relaxed max-w-3xl font-light italic">
              "{data.summary}"
            </p>
          </div>
        </motion.div>

        {/* Bento Grid (Dynamic Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.keyPillars.map((pillar, index) => (
            <motion.div 
              key={pillar.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className={`${index === 0 ? 'col-span-1 md:col-span-2' : 'col-span-1'} rounded-[32px] p-8 glass-card shadow-xl transition-all duration-500 hover:border-white/10 ${pillar.status === 'Unbalanced' ? 'bg-gradient-to-br from-white/[0.03] to-danger/[0.03] border-danger/20' : ''}`}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${pillar.status === 'Unbalanced' ? 'bg-danger/10 text-danger shadow-[0_0_15px_rgba(255,76,76,0.1)]' : 'bg-white/5 text-white/70'}`}>
                    {getPillarIcon(pillar.title)}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-paper">{pillar.title}</h3>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mt-1">Pillar Analysis 0{index + 1}</div>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${pillar.status === 'Unbalanced' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                  {pillar.status}
                </span>
              </div>
              
              <div className="space-y-4 mb-6 min-h-[60px]">
                <AnimatePresence mode="wait">
                  {activeRedline === pillar.title && pillar.redline ? (
                    <motion.div
                      key="redline"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold text-safe mb-2 flex items-center gap-2">
                        <Edit3 className="w-3 h-3" /> Proposed Redline
                      </div>
                      <RedlineView content={pillar.redline} />
                    </motion.div>
                  ) : (
                    <motion.p 
                      key={isEli5 ? 'eli5' : 'standard'}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-white/90 leading-relaxed text-[15px]"
                    >
                      {isEli5 ? pillar.eli5 : pillar.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openPushback(pillar.title, pillar.pushback)}
                  className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Draft Pushback
                </button>
                {pillar.redline && (
                  <button 
                    onClick={() => toggleRedline(pillar.title)}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 text-xs font-medium ${activeRedline === pillar.title ? 'bg-safe/20 border-safe/40 text-safe' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {activeRedline === pillar.title ? 'Hide Redline' : 'Suggest Redline'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Missing Clauses - Silent Risks */}
          {data.missingClauses && data.missingClauses.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="col-span-1 md:col-span-2 rounded-3xl p-8 glass-card border-alert/20 bg-gradient-to-br from-white/[0.03] to-alert/[0.02]"
            >
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-alert" /> Silent Risks (Missing Clauses)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.missingClauses.map((mc, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-paper font-semibold mb-2">{mc.clause}</h4>
                    <p className="text-sm text-white/70 mb-3">{mc.description}</p>
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-alert mb-1">Why it matters</p>
                      <p className="text-xs text-white/50">{mc.whyItMatters}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Footer Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center pt-8 pb-12"
        >
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white/30 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest"
          >
            Back to top
          </button>
        </motion.div>
      </div>

      <PushbackModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState(prev => ({...prev, isOpen: false}))}
        title={modalState.title}
        pushbackContent={modalState.content}
      />
    </>
  );
}
