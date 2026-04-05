import { ShieldCheck, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-2"
      >
        <span className="text-[0.6875rem] font-light tracking-[0.2em] text-secondary uppercase font-headline">
          Operational Unit 01
        </span>
      </motion.div>
      
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] mb-8 font-headline"
      >
        OBSIDIAN <br /> 
        <span className="text-secondary opacity-50">LENS</span>
      </motion.h2>

      <div className="space-y-6 max-w-xs">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 items-start"
        >
          <ShieldCheck className="text-white w-5 h-5 mt-1 shrink-0" />
          <p className="text-sm font-light leading-relaxed text-on-surface-variant">
            Deploying biometric and pixel-level scrutiny to differentiate synthetic fabrication from captured reality.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex gap-4 items-start"
        >
          <Database className="text-white w-5 h-5 mt-1 shrink-0" />
          <p className="text-sm font-light leading-relaxed text-on-surface-variant">
            Powered by the latest neural verification clusters for instant artifact detection.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
