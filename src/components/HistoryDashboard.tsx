"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { ShieldAlert, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface HistoryItem {
  id: string;
  filename: string;
  date: string;
  score: number;
  riskLevel: string;
  documentType?: string;
}

export function HistoryDashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("legal_sentinel_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) 
    : 0;

  const chartData = history.map((item, index) => ({
    name: `Doc ${index + 1}`,
    date: item.date,
    score: item.score,
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">Risk Trends</h2>
            <button 
              onClick={() => {
                localStorage.removeItem("legal_sentinel_history");
                setHistory([]);
              }}
              className="px-3 py-1 text-xs rounded-full bg-danger/10 text-danger hover:bg-danger/20 transition-colors border border-danger/20"
            >
              Clear History
            </button>
          </div>
          <p className="text-white/50 text-sm mt-1">Your historical document vulnerability</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/50 mb-1">Average Score</div>
          <div className="text-3xl font-bold flex items-center justify-end gap-2">
            {averageScore}
            {averageScore < 50 ? <ArrowDownRight className="w-5 h-5 text-danger" /> : <ArrowUpRight className="w-5 h-5 text-safe" />}
          </div>
        </div>
      </div>

      <div className="h-64 w-full mb-10 glass-card rounded-3xl p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F9F9F9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F9F9F9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#F9F9F9' }}
            />
            <Area type="monotone" dataKey="score" stroke="#F9F9F9" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <h3 className="text-lg font-medium mb-4">Recent Documents</h3>
      <div className="space-y-3">
        {history.slice().reverse().map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/50" />
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">{item.filename}</div>
                  {item.documentType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/40 uppercase tracking-tighter font-bold">
                      {item.documentType}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/40">{item.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full border ${
                item.score < 50 ? 'border-danger/30 text-danger bg-danger/10' : 
                item.score < 75 ? 'border-caution/30 text-caution bg-caution/10' : 
                'border-safe/30 text-safe bg-safe/10'
              }`}>
                {item.score}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
