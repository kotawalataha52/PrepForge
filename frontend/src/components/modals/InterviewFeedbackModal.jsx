import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

const InterviewFeedbackModal = ({ isOpen, feedbackData }) => {
  const navigate = useNavigate();

  if (!isOpen || !feedbackData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        {/* Modal Structure */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative w-full max-w-2xl glass-card border border-white/10 rounded-3xl p-1 z-10 shadow-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 overflow-hidden"
        >
          {/* Inner Content */}
          <div className="bg-gray-900 border border-white/5 rounded-[1.4rem] p-8 h-full shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[1px] shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-display font-bold text-center text-white mb-2">Interview Concluded</h2>
            <p className="text-gray-400 text-center mb-8">The AI has analyzed your responses.</p>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Score Card */}
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart3 className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-5xl font-display font-bold text-white mb-1">
                  {feedbackData.score}<span className="text-2xl text-gray-500">/100</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Overall Score</div>
              </div>

              {/* Feedback Summary */}
              <div className="flex-[2] bg-white/5 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3 text-cyan-400">
                  <CheckCircle size={18} />
                  <h3 className="font-bold">AI Assessment</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feedbackData.feedback}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-base hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 flex justify-center items-center gap-2"
            >
              Return to Dashboard <ArrowRight size={18} />
            </button>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewFeedbackModal;
