import React from 'react';
import { ArrowRight, Bot, Target, Zap, Clock, ShieldCheck, PlayCircle, BarChart3, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const slideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="relative min-h-screen pt-20">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30vw] h-[30vw] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-[-1] " />
        <div className="container max-w-5xl mx-auto relative z-10">
          <motion.div 
            custom={1} initial="hidden" animate="visible" variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" /> Waitlist Open. Join the Revolution.
          </motion.div>
          
          <motion.h1 
            custom={2} initial="hidden" animate="visible" variants={fadeIn}
            className="text-6xl md:text-8xl font-black font-display tracking-tighter mb-8 leading-[1.1]"
          >
            Forge Your Dream <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Job with AI.</span>
          </motion.h1>
          
          <motion.p 
            custom={3} initial="hidden" animate="visible" variants={fadeIn}
            className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Experience highly realistic, AI-driven mock interviews. Analyze your skills, master your domain, and conquer the hiring process like never before.
          </motion.p>
          
          <motion.div 
            custom={4} initial="hidden" animate="visible" variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/register" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg flex items-center gap-2 hover:bg-gray-100 transition-all duration-300">
              Start Practicing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview (Visual Hook) */}
      <section className="px-4 -mt-10 mb-32 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="container max-w-6xl mx-auto"
        >
          <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.1)] aspect-video bg-gradient-to-b from-gray-900 to-black relative flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
            <Bot className="w-24 h-24 text-cyan-400 opacity-80 animate-pulse relative z-10" />
          </div>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent">
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">How PrepForge Works</h2>
            <p className="text-gray-400 text-xl">Three steps to mastering your technical interview.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-30 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full glass border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)] bg-gray-900">
                <span className="text-3xl font-bold text-cyan-400">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Upload Resume</h3>
              <p className="text-gray-400">Upload your PDF. Our ATS Engine instantly dissects your core skills, tailoring the upcoming interview exactly to your stated experience.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full glass border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-gray-900">
                <span className="text-3xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Face the AI</h3>
              <p className="text-gray-400">Join a mock room. The AI plays the role of a strict FAANG manager, stress-testing your knowledge via live voice or rigorous chat.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full glass border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)] bg-gray-900">
                <span className="text-3xl font-bold text-cyan-400">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Review Analytics</h3>
              <p className="text-gray-400">Get an instant, deep-dive evaluation. We highlight your exact flaws, where you rambled, and the optimal architectural answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideIn}
            className="mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Intelligence built for <span className="text-purple-400">Preparation.</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl">
              Everything you need to step into the technical interview room with absolute confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureCard 
              icon={<Bot />}
              title="Hyper-Realistic AI"
              desc="Simulates behavioral and technical rounds with dynamic follow-ups based on your resume and role."
            />
            <FeatureCard 
              icon={<LineChart />}
              title="Deep Analytics"
              desc="Track streaks, precision, time management, and identify weak areas via sleek interactive charts."
            />
            <FeatureCard 
              icon={<MessageSquare />}
              title="Voice & Chat Modes"
              desc="Practice like a real interview. Use your microphone or text. We analyze tone, speed, and accuracy."
            />
            <FeatureCard 
              icon={<Shield />}
              title="Resume Analyzer"
              desc="Upload your PDF. We instantly tailor the entire mock interview around your exact project history."
            />
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section id="philosophy" className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-cyan-900/10">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Why We Built PrepForge</h2>
            <div className="glass-card p-10 md:p-14 rounded-3xl text-left relative overflow-hidden group border border-cyan-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-colors duration-700" />
              
              <div className="relative z-10 space-y-6 text-gray-300 text-lg leading-relaxed font-light">
                <p>
                  The technical interview process is notoriously opaque. For decades, it has operated as a black box where engineering talent is often judged on high-pressure algorithmic puzzles rather than actual system-building capability. 
                </p>
                <p>
                  We believe that <strong className="text-white font-semibold">preparation shouldn't be a privilege</strong> gated behind expensive coaching, exclusive bootcamps, or insider networks. 
                </p>
                <p>
                  PrepForge was forged to democratize the hiring pipeline. By leveraging state-of-the-art Local Generative AI, we are putting FAANG-level evaluation, psychological stress-testing, and rigorous predictive ATS parsing directly into your hands—privately, securely, and infinitely.
                </p>
                <div className="pt-6 mt-8 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                    PF
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl font-display tracking-wide">Taha Kotawala</h4>
                    <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mt-1">Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 relative overflow-hidden flex justify-center items-center text-center px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 max-w-3xl glass-card border border-cyan-500/30 p-12 md:p-16 rounded-3xl box-glow-violet"
        >
          <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">Ready to dominate?</h2>
          <p className="text-gray-400 text-xl mb-10">Join thousands of engineers forging their path to top tech companies.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all duration-300 transform hover:-translate-y-1">
            Start Foraging Free
            <Zap className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} PrepForge. AI Interview Mastery. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-8 rounded-2xl group border border-white/5 hover:border-cyan-500/30 transition-all duration-300"
  >
    <div className="w-14 h-14 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center mb-6 text-cyan-400 group-hover:text-purple-400 group-hover:shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-display text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
  </motion.div>
);

export default Landing;
