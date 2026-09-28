import React from 'react';
import { 
  ArrowRight, 
  Bot, 
  Target, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  LineChart, 
  MessageSquare, 
  Shield, 
  FileText,
  Download,
  Cpu,
  CheckCircle2,
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const Landing = () => {
  return (
    <div className="relative min-h-screen pt-20 bg-[#07080C] overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 md:pt-36 md:pb-28 flex flex-col items-center justify-center text-center">
        <div className="container max-w-4xl mx-auto relative z-10">
          
          <motion.div 
            custom={1} initial="hidden" animate="visible" variants={fadeIn}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Technical Career & Interview Studio</span>
          </motion.div>
          
          <motion.h1 
            custom={2} initial="hidden" animate="visible" variants={fadeIn}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight text-white mb-6 leading-[1.1]"
          >
            Forge Your Career With <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-300">
              Precision Technical Intelligence.
            </span>
          </motion.h1>
          
          <motion.p 
            custom={3} initial="hidden" animate="visible" variants={fadeIn}
            className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
          >
            Real-time simulated technical interviews, predictive ATS diagnostics, and instant job-tailored resume generation powered by ultra-low-latency intelligent engine.
          </motion.p>
          
          <motion.div 
            custom={4} initial="hidden" animate="visible" variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition duration-200"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              to="/resume-tailor" 
              className="w-full sm:w-auto px-6 py-3.5 glass hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition duration-200"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              Tailor Your Resume
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-6 relative border-t border-white/5 bg-black/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
              Engineered for Complete Interview Mastery
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Three synchronized tools designed to take you from application submission to signed offer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Resume Tailor */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card p-7 rounded-2xl border border-white/10 relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">NEW FEATURE</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Job-Tailored Resume Builder</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Paste any job description and let Gemini rewrite your resume bullets with quantified impact metrics, ATS keywords, and instant PDF download.
              </p>
              <Link to="/resume-tailor" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Open Resume Studio <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Feature 2: Simulated Interviewer */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card p-7 rounded-2xl border border-white/10 relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">REAL-TIME SIMULATION</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">AI Technical Interviewer</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Engage in conversational mock interviews tailored to your exact projects. Tests architecture, system design tradeoffs, and algorithmic depth.
              </p>
              <Link to="/dashboard" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                Start Mock Interview <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Feature 3: Resume Intel */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card p-7 rounded-2xl border border-white/10 relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">ATS SCANNER</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Resume Intel Diagnostics</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Upload your existing PDF to diagnose formatting flaws, missing industry keywords, and concrete actionable suggestions to beat recruitment filters.
              </p>
              <Link to="/resume-intel" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Scan Resume <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              How PrepForge Works
            </h2>
            <p className="text-gray-400 text-sm">
              Your step-by-step workflow from preparation to mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                1
              </div>
              <h4 className="text-base font-bold text-white">Upload & Tailor</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Provide your background and target job description to build a customized profile and ATS-optimized resume sheet.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600/20 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/30">
                2
              </div>
              <h4 className="text-base font-bold text-white">Live Mock Simulation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Join a live room where your technical depth, communication clarity, and problem-solving tradeoffs are evaluated.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600/20 text-teal-400 font-bold flex items-center justify-center text-sm border border-teal-500/30">
                3
              </div>
              <h4 className="text-base font-bold text-white">Actionable Feedback</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive instant granular feedback, rubric scores, and precise areas for improvement before your real interview.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-xs border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} PrepForge. Next-Gen Technical Interview & Resume Studio.</p>
      </footer>
    </div>
  );
};

export default Landing;
