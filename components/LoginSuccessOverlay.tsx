import React from 'react';

interface LoginSuccessOverlayProps {
  onContinue: () => void;
  imageSrc?: string;
}

/**
 * Full-screen celebratory overlay shown right after successful login.
 * Uses the brand logo as a full-screen background.
 */
const LoginSuccessOverlay: React.FC<LoginSuccessOverlayProps> = ({ onContinue, imageSrc = '/assets/screen%20back%20ground.jpeg' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Full-screen logo background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${imageSrc})`,
          filter: 'brightness(0.4) saturate(1.2)'
        }}
      />
      
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/70" />
      
      {/* Animated glow effects */}
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(53,198,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,79,163,0.4) 0%, transparent 50%)' }} />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6 max-w-2xl">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90 animate-pulse">Welcome back</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_6px_32px_rgba(255,79,163,0.5)]">
            Logged in successfully
          </h2>
          <p className="text-lg text-slate-300/90 leading-relaxed max-w-lg mx-auto">
            You&apos;re now connected to Anchor&apos;s world-first AI security platform. Your dashboard is ready with live insights and predictive CVE intelligence.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            onClick={onContinue}
            className="px-8 py-4 rounded-full font-bold text-lg text-white shadow-[0_0_40px_rgba(53,198,255,0.4)] bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:brightness-110 hover:scale-105 transition-all duration-300"
          >
            Continue to Dashboard →
          </button>
          <span className="text-sm text-slate-400/80">Press Enter or click to continue</span>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessOverlay;
