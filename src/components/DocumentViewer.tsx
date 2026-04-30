"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface DocumentViewerProps {
  file: File | null;
}

export function DocumentViewer({ file }: DocumentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!fileUrl) {
    return (
      <div className="w-full h-full min-h-[600px] rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/50">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full h-full min-h-[700px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative"
    >
      {/* We use an iframe to display the PDF natively. For a production app, react-pdf might be used for text-highlighting */}
      <iframe 
        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`} 
        className="w-full h-full bg-white"
        title="Document Viewer"
      />
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-charcoal/80 backdrop-blur border border-white/10 text-xs font-medium text-white/80 shadow-lg flex items-center gap-2">
        <FileText className="w-3 h-3" />
        {file?.name || 'Document Viewer'}
      </div>
    </motion.div>
  );
}
