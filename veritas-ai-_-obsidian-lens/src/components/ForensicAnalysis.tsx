import React from 'react';
import { motion } from 'motion/react';

interface ForensicCardProps {
  title: string;
  image: string;
  description: string;
  delay: number;
}

const ForensicCard: React.FC<ForensicCardProps> = ({ title, image, description, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group hover:bg-white/[0.02] p-6 rounded-xl transition-all border border-transparent hover:border-white/5"
    >
      <p className="text-[10px] uppercase tracking-widest text-white mb-4 opacity-40">{title}</p>
      <div className="aspect-video bg-[#0a0d1e] rounded-lg mb-4 overflow-hidden border border-white/5">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="text-xs font-light text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default function ForensicAnalysis() {
  const analyses = [
    {
      title: "Artifact Detection",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=400",
      description: "Identifying pixel-level inconsistencies and compression noise signatures unique to GAN-generated content.",
      delay: 0.1
    },
    {
      title: "Lighting Consistency",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
      description: "Analyzing light source vectors to ensure shadows and reflections align with physics-based environmental data.",
      delay: 0.2
    },
    {
      title: "Semantic Logic",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
      description: "Verifying structural anatomical accuracy and environmental context against known biological and physical rules.",
      delay: 0.3
    }
  ];

  return (
    <section className="mt-24">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <h4 className="text-[10px] uppercase tracking-[0.4em] text-secondary/40 whitespace-nowrap">Forensic Depth Analysis</h4>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {analyses.map((item, idx) => (
          <ForensicCard 
            key={idx} 
            title={item.title}
            image={item.image}
            description={item.description}
            delay={item.delay}
          />
        ))}
      </div>
    </section>
  );
}
