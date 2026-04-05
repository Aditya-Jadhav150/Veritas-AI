import React, { useState, useRef } from 'react';
import { Upload, Info, RefreshCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../types';

export default function Analyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateThumbnail = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 100;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.src = src;
    });
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const isReal = data.prediction === 'REAL';
        const primaryProb = isReal ? data.real_prob : data.fake_prob;

          const thumb = image ? await generateThumbnail(image) : undefined;

          const newResult: AnalysisResult = {
            status: data.prediction,
            integrityLevel: isReal ? 'AUTHENTIC' : 'MANIPULATED',
            confidenceScore: primaryProb,
            artifactDetection: isReal ? "No significant inconsistencies detected." : "Detected artifact signatures commonly associated with Deepfakes.",
            lightingConsistency: isReal ? "Lighting and shadows appear physically accurate." : "Potential structural and lighting mismatches found.",
            semanticLogic: "Analysis complete.",
            timestamp: new Date().toISOString(),
            thumbnail: thumb
          };
          
          setResult(newResult);

          const prevHistory = JSON.parse(localStorage.getItem('veritas_history') || '[]');
          localStorage.setItem('veritas_history', JSON.stringify([newResult, ...prevHistory]));
        } else {
          setErrorMsg(data.message || "Failed to analyze image.");
        }
      } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMsg("Network error communicating with Veritas-AI core.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setImage(null);
    setSelectedFile(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8" id="analyzer">
      <section className="glass-panel rounded-xl p-8 white-bloom relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white font-headline">DeepFake Detector</h3>
              <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
                Status: {image ? 'File Loaded' : 'Ready for Input'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
              />
              <span className="text-[10px] uppercase tracking-widest text-white font-headline">Active Node</span>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative bg-[#0a0d1e] border-dashed border border-white/20 rounded-lg h-80 flex flex-col items-center justify-center transition-all hover:bg-surface-container-low/60 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 pulse-border pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-white/20 group-hover:text-white/60 transition-colors duration-500" />
                <div className="mt-6 text-center">
                  <p className="text-white font-medium tracking-tight">Drop your photos here</p>
                  <p className="text-secondary/50 text-[11px] uppercase tracking-widest mt-2">Max Payload: 50MB | RAW, TIFF, PNG</p>
                </div>
              </>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*"
            />
            
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-secondary/60">
              <Info className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">PyTorch / ViT Analysis</span>
            </div>
            
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 font-mono text-xs">
                <AlertTriangle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            <button 
              onClick={runAnalysis}
              disabled={!image || isAnalyzing}
              className="chrome-gradient text-black font-bold py-4 px-10 rounded-sm text-xs uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl white-bloom disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {result && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-panel rounded-xl p-6 border border-white/5">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-headline">Authentication Result</span>
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${result.status === 'REAL' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  {result.status === 'REAL' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${result.status === 'REAL' ? 'text-green-500' : 'text-red-500'}`}>
                    {result.status === 'REAL' ? 'Verified' : 'Flagged'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={`text-4xl font-black tracking-tighter font-headline ${result.status === 'REAL' ? 'text-green-500' : 'text-red-500'}`}>
                  {result.status}
                </div>
                <div className="h-12 w-[1px] bg-white/10" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-secondary">Integrity Level</p>
                  <p className="text-xl font-bold text-white">{result.integrityLevel}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-headline">Confidence Score</span>
                  <span className="text-sm font-bold text-white">{result.confidenceScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidenceScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full shadow-[0_0_10px_rgba(255,255,255,0.4)] ${result.status === 'REAL' ? 'bg-green-500' : 'bg-red-500'}`} 
                  />
                </div>
              </div>
              <button 
                onClick={reset}
                className="mt-4 flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 hover:bg-white/5 transition-all rounded-sm"
              >
                <RefreshCcw className="w-3 h-3" />
                Scan Another Image
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
