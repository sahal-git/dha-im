import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formattedEmail = email.includes('@') ? email : `${email}@dha-im.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password,
    });

    if (error) {
      if (error.message === 'Failed to fetch' || error.message.includes('network')) {
        setError("Couldn't connect. Please try again.");
      } else {
        setError("That username or password doesn't look right.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE] flex items-center justify-center p-6 md:p-12 font-sans overflow-hidden relative">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24 z-10">
        
        {/* Left Side: Brand & Hero */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in-up-delay-1">
          
          <div className="mb-6 md:mb-12 flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl font-bold text-[#087A45] tracking-tight">
              Dha’im
            </h1>
          </div>

          {/* Mobile Illustration (Hidden on Desktop) */}
          <div className="w-full max-w-[260px] md:hidden mb-8 relative flex justify-center animate-float">
             <JourneyIllustration />
          </div>

          <h2 className="text-3xl md:text-[2.75rem] font-semibold text-[#17352A] leading-[1.15] mb-4 md:mb-8 max-w-lg">
            Your daily journey starts here.
          </h2>
          
          <div className="text-[#718079] text-lg md:text-xl space-y-3 mb-8 hidden md:block">
            <p className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18B968]"></span>
              Track your progress.
            </p>
            <p className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]"></span>
              Build consistency.
            </p>
            <p className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFE4F7]"></span>
              Keep moving forward.
            </p>
          </div>
          
          {/* Desktop Illustration (Hidden on Mobile) */}
          <div className="hidden md:block w-full max-w-[420px] relative mt-2 animate-float">
             <JourneyIllustration />
          </div>

        </div>

        {/* Right Side: Login Card */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-fade-in-up-delay-2">
          <div className="w-full max-w-[440px] bg-white rounded-[24px] border border-[#E8ECE9] shadow-[0_12px_40px_rgb(23,53,42,0.04)] p-6 md:p-8 lg:p-10 relative">
            
            {/* Subtle decorative pattern in the corner of the card */}
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-[24px] opacity-[0.03] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full transform translate-x-4 -translate-y-4">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#17352A" />
                <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="white" />
              </svg>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#17352A] mb-2 flex items-center gap-2">
                Welcome back <span className="animate-wave inline-block origin-bottom-right">👋</span>
              </h3>
              <p className="text-[#718079]">Sign in to continue your journey.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#FFF9EE] border border-[#FFD0A3] text-[#17352A] rounded-xl text-sm font-medium animate-fade-in flex items-start gap-3">
                <div className="mt-0.5 text-[#D6A84F]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#17352A]">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#E8ECE9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18B968] focus:border-transparent transition-all text-[#17352A] placeholder-[#A0ABAC] shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#17352A]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#E8ECE9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18B968] focus:border-transparent transition-all text-[#17352A] placeholder-[#A0ABAC] shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-4 flex items-center justify-center gap-2 bg-[#087A45] hover:bg-[#066336] text-white font-medium rounded-xl disabled:opacity-70 transition-all duration-200 active:scale-[0.98] shadow-[0_4px_12px_rgb(8,122,69,0.2)] hover:shadow-[0_6px_16px_rgb(8,122,69,0.25)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E8F6EE] blur-3xl opacity-70 pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FFF0B8] blur-3xl opacity-40 pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#F6C5D8] blur-3xl opacity-20 pointer-events-none -z-10" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(14deg); }
          40% { transform: rotate(-8deg); }
          60% { transform: rotate(14deg); }
          80% { transform: rotate(-4deg); }
          100% { transform: rotate(10deg); }
        }
        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 2.5s infinite;
        }
      `}} />
    </div>
  );
}

function JourneyIllustration() {
  return (
    <div className="relative w-full aspect-[4/3] flex items-center justify-center">
      <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Soft decorative background blobs */}
        <circle cx="200" cy="150" r="120" fill="#E8F6EE" opacity="0.5" filter="blur(20px)" />
        
        {/* The Path */}
        <path d="M 60 220 C 130 250, 180 180, 240 180 S 320 120, 340 100" stroke="#087A45" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" opacity="0.2" />

        {/* Nodes representing the journey */}
        
        {/* Node 1: Prayer/Start */}
        <g transform="translate(80, 210)">
          <circle cx="0" cy="0" r="28" fill="#FFF" stroke="#E8ECE9" strokeWidth="2" />
          <circle cx="0" cy="0" r="20" fill="#E8F6EE" />
          {/* Simple arch icon */}
          <path d="M-6 6 L-6 -2 A 6 6 0 0 1 6 -2 L6 6 Z" fill="#18B968" />
        </g>

        {/* Node 2: Quran/Learning */}
        <g transform="translate(160, 190)">
          <circle cx="0" cy="0" r="32" fill="#FFF" stroke="#E8ECE9" strokeWidth="2" />
          <circle cx="0" cy="0" r="24" fill="#FFF0B8" />
          {/* Simple book icon */}
          <path d="M-8 -3 L-2 0 L-2 8 L-8 4 Z M2 0 L8 -3 L8 4 L2 8 Z" fill="#D6A84F" />
        </g>
        
        {/* Node 3: Growth/Hifz */}
        <g transform="translate(250, 150)">
          <circle cx="0" cy="0" r="36" fill="#FFF" stroke="#E8ECE9" strokeWidth="2" />
          <circle cx="0" cy="0" r="28" fill="#BFE4F7" />
          {/* Simple leaf/growth icon */}
          <path d="M0 8 C -10 0, -8 -8, 0 -6 C 8 -8, 10 0, 0 8 Z" fill="#087A45" />
        </g>

        {/* Node 4: Progress/Star */}
        <g transform="translate(330, 90)">
          <circle cx="0" cy="0" r="42" fill="#FFF" stroke="#E8ECE9" strokeWidth="2" />
          <circle cx="0" cy="0" r="32" fill="#D9C8F2" />
          {/* 8-pointed star icon */}
          <path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="#17352A" />
        </g>

        {/* Decorative elements */}
        <circle cx="80" cy="100" r="4" fill="#D6A84F" opacity="0.6" />
        <circle cx="300" cy="240" r="3" fill="#18B968" opacity="0.4" />
        <circle cx="160" cy="80" r="5" fill="#FFD0A3" opacity="0.5" />
        
        {/* Subtle geometric stars */}
        <g transform="translate(210, 60) scale(0.6)" opacity="0.7">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#D6A84F" />
        </g>
        <g transform="translate(100, 280) scale(0.4)" opacity="0.5">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#087A45" />
        </g>

      </svg>
    </div>
  );
}
