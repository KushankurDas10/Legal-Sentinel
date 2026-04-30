"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  ShieldAlert, 
  History
} from "lucide-react";
import { AnalysisResponse } from "@/lib/schema";
import { DocumentViewer } from "@/components/DocumentViewer";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { HistoryDashboard } from "@/components/HistoryDashboard";
import { ChatInterface } from "@/components/ChatInterface";
import { InteractiveBackground } from "@/components/InteractiveBackground";

type ViewState = "upload" | "analysis" | "history";

export default function LegalSentinelDashboard() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisData(data.result);
      setExtractedText(data.extractedText || "");
      
      // Persist to local history
      const savedHistory = localStorage.getItem("legal_sentinel_history");
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      const newEntry = {
        id: crypto.randomUUID(),
        filename: selectedFile.name,
        date: new Date().toISOString(),
        score: data.result.overallScore,
        riskLevel: data.result.riskLevel,
        documentType: data.result.documentType
      };
      localStorage.setItem("legal_sentinel_history", JSON.stringify([...history, newEntry]));

      setViewState("analysis");
    } catch (error: any) {
      alert(error.message || "Failed to analyze document.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysisData(null);
    setViewState("upload");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-paper selection:bg-alert/30 selection:text-paper font-outfit overflow-x-hidden relative">
      {/* Perspective Grid Background */}
      <InteractiveBackground />
      
      {/* Visual Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A] opacity-40" />
      </div>

      {/* Animated Scan Line Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-alert to-transparent opacity-40 shadow-[0_0_30px_rgba(255,76,76,1)]"
        >
          <div className="absolute inset-0 bg-alert blur-sm opacity-50" />
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .font-playfair { font-family: var(--font-playfair); }
        .font-outfit { font-family: var(--font-outfit); }
      `}} />
      
      <header className="px-10 py-8 flex justify-between items-center border-b border-white/[0.03] sticky top-0 bg-[#0A0A0A]/60 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={resetAnalysis}>
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-alert blur-lg rounded-full"
            />
            <div className="w-10 h-10 rounded-xl bg-alert flex items-center justify-center shadow-[0_0_20px_rgba(255,76,76,0.3)] relative z-10 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tighter font-playfair italic">Legal Sentinel</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setViewState(viewState === "history" ? (analysisData ? "analysis" : "upload") : "history")}
            className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            <History className="w-4 h-4" />
            {viewState === "history" ? "Back to Dashboard" : "History"}
          </button>
          {viewState === "analysis" && (
            <button 
              onClick={resetAnalysis}
              className="px-5 py-2 rounded-full bg-paper text-charcoal text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Analyze New
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* UPLOAD STATE */}
          {viewState === "upload" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto mt-20"
            >
              <div className="text-center mb-16 relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-alert mb-8"
                >
                  AI-Powered Protection
                </motion.div>
                <h2 className="text-7xl md:text-8xl font-semibold tracking-tightest mb-8 font-playfair leading-[0.9]">
                  Demystify Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-paper via-paper to-white/20 italic">Contracts.</span>
                </h2>
                <p className="text-xl text-white/50 max-w-xl mx-auto font-light leading-relaxed">
                  The world's most advanced AI guardian for your legal interests. 
                  Uncover hidden risks before you sign.
                </p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                className={`
                  relative overflow-hidden rounded-[40px] border border-white/5 transition-all duration-500 ${!isAnalyzing && 'cursor-pointer'}
                  ${isDragging ? 'bg-alert/5 scale-[1.02] border-alert/20' : 'bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'}
                  ${isAnalyzing ? 'pointer-events-none' : ''}
                  p-20 flex flex-col items-center justify-center text-center backdrop-blur-3xl
                `}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent" />
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.txt"
                  onChange={handleFileInput}
                />
                
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-8 relative z-20"
                  >
                    {/* Cinematic Scanning Beam */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px] z-10">
                      <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 w-full h-1/4 bg-gradient-to-b from-transparent via-alert/30 to-transparent blur-xl"
                      />
                      
                      {/* Sonar Pulse */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.8, opacity: [0, 0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 border-[2px] border-alert/20 rounded-full m-auto w-64 h-64"
                      />

                      {/* Flying Text Fragments */}
                      {[...Array(15)].map((_, i) => {
                        const keywords = extractedText ? extractedText.split(/\s+/).filter(w => w.length > 5).slice(0, 50) : [];
                        const displayWord = keywords.length > 0 
                          ? keywords[Math.floor(Math.random() * keywords.length)].toUpperCase()
                          : ["SECTION 4.2", "INDEMNIFICATION", "LIABILITY CAP", "TERMINATION", "GOVERNING LAW", "FORCE MAJEURE", "CONFIDENTIALITY"][Math.floor(Math.random() * 7)];
                        
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: Math.random() * 400 - 200, y: 200 }}
                            animate={{ 
                              opacity: [0, 1, 0], 
                              y: -200,
                              x: (Math.random() * 400 - 200) + (Math.random() * 50)
                            }}
                            transition={{ 
                              duration: 2 + Math.random() * 2, 
                              repeat: Infinity, 
                              delay: Math.random() * 2 
                            }}
                            className="absolute text-[8px] font-mono text-alert/60 whitespace-nowrap bg-alert/5 px-2 py-0.5 rounded border border-alert/10"
                          >
                            {displayWord}
                          </motion.div>
                        );
                      })}

                      {/* Risk Popup Notifications */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`risk-${i}`}
                          initial={{ opacity: 0, scale: 0, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0, 1.2, 0],
                            y: "-=30"
                          }}
                          transition={{ 
                            duration: 1.8, 
                            repeat: Infinity, 
                            delay: i * 0.6 
                          }}
                          className="absolute flex items-center gap-1.5 bg-danger/20 border border-danger/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[8px] font-bold text-danger uppercase tracking-tighter"
                        >
                          <ShieldAlert className="w-2.5 h-2.5" /> High Risk Detected
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-[1px] border-white/10 border-t-alert animate-[spin_2s_linear_infinite]" />
                      <div className="absolute inset-2 rounded-full border-[1px] border-white/5 border-b-safe animate-[spin_3s_linear_infinite_reverse]" />
                      <ShieldAlert className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-alert shadow-[0_0_15px_rgba(255,76,76,0.5)]" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-medium font-playfair italic text-paper">Guardian scanning...</h3>
                      <p className="text-sm text-white/30 tracking-widest uppercase font-bold animate-pulse">Running semantic risk audit</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-3xl bg-alert/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <UploadCloud className={`w-10 h-10 relative transition-colors duration-300 ${isDragging ? 'text-alert' : 'text-white/40'}`} />
                    </div>
                    <h3 className="text-3xl font-medium mb-3 font-playfair text-paper">Drop your contract</h3>
                    <p className="text-white/30 mb-8 text-sm font-medium tracking-wide">PDF or TXT (Max 10MB)</p>
                    <button className="px-10 py-4 rounded-full bg-paper text-charcoal font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95">
                      Select Document
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYSIS STATE (SIDE-BY-SIDE) */}
          {viewState === "analysis" && analysisData && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              {/* Left Pane: Document Viewer */}
              <div className="hidden xl:block h-[calc(100vh-140px)] sticky top-24">
                <DocumentViewer file={file} />
              </div>

              {/* Right Pane: Analysis Panel */}
              <div className="w-full">
                <AnalysisPanel data={analysisData} />
              </div>
            </motion.div>
          )}

          {/* HISTORY STATE */}
          {viewState === "history" && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <HistoryDashboard />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {viewState === "analysis" && analysisData && (
        <ChatInterface contractText={extractedText} documentType={analysisData.documentType} />
      )}
    </div>
  );
}
