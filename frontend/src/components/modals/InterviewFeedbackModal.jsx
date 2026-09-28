import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle, BarChart3, X, MessageSquare, Calendar, User, Target } from 'lucide-react';

const InterviewFeedbackModal = ({ isOpen, feedbackData, onClose }) => {
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'transcript'

  if (!isOpen || !feedbackData) return null;

  const score = feedbackData.score || 0;
  const isGoodScore = score >= 70;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />
        
        {/* Modal Structure */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {feedbackData.role || 'Software Engineer'} • Session Review
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {feedbackData.createdAt ? new Date(feedbackData.createdAt).toLocaleDateString() : 'Completed Session'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 pt-2 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'feedback'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              AI Assessment & Score
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transcript'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Full Transcript ({feedbackData.transcript?.length || 0})
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'feedback' ? (
              <div className="space-y-5">
                {/* Score & Rating Chip */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-display font-extrabold text-slate-900">
                      {score}<span className="text-lg text-slate-400 font-normal">/100</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isGoodScore 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {isGoodScore ? 'Strong Performance' : 'Needs Practice'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 sm:border-l sm:border-slate-200 sm:pl-5 flex-1">
                    Evaluated against technical depth, communication clarity, problem-solving, and algorithmic proficiency.
                  </div>
                </div>

                {/* AI Detailed Feedback */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Detailed Evaluator Assessment
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {feedbackData.feedback || "Detailed rubric feedback generated for your session."}
                  </div>
                </div>
              </div>
            ) : (
              /* Full Transcript View */
              <div className="space-y-3">
                {(!feedbackData.transcript || feedbackData.transcript.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-8">No transcript recorded for this session.</p>
                ) : (
                  feedbackData.transcript.map((item, idx) => {
                    const isAi = item.sender === 'ai';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 p-3.5 rounded-xl text-xs leading-relaxed ${
                          isAi 
                            ? 'bg-blue-50/50 border border-blue-100 text-slate-800' 
                            : 'bg-slate-50 border border-slate-100 text-slate-700 ml-4'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isAi ? (
                            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                              AI
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                              <User className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[11px] mb-0.5 flex items-center gap-1.5 text-slate-900">
                            <span>{isAi ? 'AI Interviewer' : 'You'}</span>
                          </div>
                          <p className="whitespace-pre-line">{item.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
            >
              Done Reviewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewFeedbackModal;
