import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  CheckCircle2, 
  Trophy, 
  Star, 
  BarChart3, 
  Target, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Eye, 
  Clock,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';
import ConfigureInterviewModal from '../components/modals/ConfigureInterviewModal';
import InterviewFeedbackModal from '../components/modals/InterviewFeedbackModal';
import api from '../utils/api';

const StatCard = ({ title, value, icon, accentColor, textColor, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between"
  >
    {/* Colored Top Accent Bar */}
    <div className={`absolute top-0 left-0 right-0 h-1.5 ${accentColor}`} />

    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
        {icon}
      </div>
    </div>

    <div>
      <h2 className={`text-3xl font-display font-extrabold tracking-tight ${textColor}`}>
        {value}
      </h2>
      <h4 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1">
        {title}
      </h4>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [selectedInterviewForReview, setSelectedInterviewForReview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-open modal if requested in URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setIsConfigureModalOpen(true);
    }
  }, [location.search]);

  const handleCloseConfigureModal = () => {
    setIsConfigureModalOpen(false);
    if (location.search.includes('action=new')) {
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interview/history');
        setInterviews(res.data?.data || []);
      } catch (err) {
        console.error("Failed fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.score !== undefined && i.score !== null).length;
  
  const bestScore = totalInterviews > 0 
    ? Math.max(...interviews.map(i => i.score || 0)) 
    : 0;

  const avgScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc, cur) => acc + (cur.score || 0), 0) / totalInterviews) 
    : 0;

  // Rating out of 10
  const hireRating = totalInterviews > 0 ? (avgScore / 10).toFixed(1) : '0';

  const latestInterview = interviews.length > 0 ? interviews[0] : null;

  return (
    <>
      <ConfigureInterviewModal 
        isOpen={isConfigureModalOpen} 
        onClose={handleCloseConfigureModal} 
      />

      <InterviewFeedbackModal 
        isOpen={!!selectedInterviewForReview} 
        feedbackData={selectedInterviewForReview}
        onClose={() => setSelectedInterviewForReview(null)} 
      />

      <div className="space-y-7 pb-12">
        
        {/* Top Overview Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Performance Analytics
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Monitor your mock interviews and performance metrics.
            </p>
          </div>

          <button 
            onClick={() => setIsConfigureModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-600/20 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Launch Mock Interview</span>
          </button>
        </div>

        {/* 4 Colored Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="TOTAL ATTEMPTS" 
            value={totalInterviews} 
            icon={<ClipboardList size={18} className="text-blue-600" />} 
            accentColor="bg-blue-500" 
            textColor="text-blue-600"
            delay={0.05} 
          />
          <StatCard 
            title="COMPLETED" 
            value={completedInterviews} 
            icon={<CheckCircle2 size={18} className="text-emerald-600" />} 
            accentColor="bg-emerald-500" 
            textColor="text-emerald-600"
            delay={0.1} 
          />
          <StatCard 
            title="BEST SCORE" 
            value={totalInterviews > 0 ? `${bestScore}%` : '—'} 
            icon={<Trophy size={18} className="text-purple-600" />} 
            accentColor="bg-purple-500" 
            textColor="text-purple-600"
            delay={0.15} 
          />
          <StatCard 
            title="AVERAGE SCORE" 
            value={totalInterviews > 0 ? `${avgScore}%` : '—'} 
            icon={<Gauge size={18} className="text-amber-500" />} 
            accentColor="bg-amber-500" 
            textColor="text-amber-600"
            delay={0.2} 
          />
        </div>

        {/* Main 2-Column Analytics Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Card 1: Score Trend & History */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[380px]"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Score Trend & History</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {interviews.length} Sessions
                </span>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-bold text-sm mb-1">No sessions recorded yet</h4>
                  <p className="text-slate-400 text-xs max-w-xs mb-5">Complete your first mock interview to view score progression, rubric diagnostics, and feedback history.</p>
                  <button 
                    onClick={() => setIsConfigureModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    Start First Attempt
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div 
                      key={interview._id}
                      onClick={() => setSelectedInterviewForReview(interview)}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 flex justify-between items-center gap-3 transition cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <h4 className="text-slate-800 font-semibold text-xs md:text-sm group-hover:text-blue-600 transition truncate">
                          {interview.role} Mock Interview
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{Math.floor((interview.transcript?.length || 0)/2)} Questions</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          interview.score >= 70 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {interview.score}/100
                        </span>

                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Review</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {interviews.length > 0 && (
              <div className="pt-4 mt-5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsConfigureModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Launch Another Session</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Card 2: AI Evaluator Focus & Rubric Insights */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[380px]"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">AI Evaluator Focus</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Rubric Assessment
                </span>
              </div>

              {latestInterview && latestInterview.feedback ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="text-purple-700">Latest: {latestInterview.role}</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{latestInterview.score}/100</span>
                    </div>
                    <p className="line-clamp-6 text-slate-600 pt-2 border-t border-slate-200/80">
                      {latestInterview.feedback}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedInterviewForReview(latestInterview)}
                    className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Review & Transcript</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-bold text-sm mb-1">Evaluator awaiting your first session</h4>
                  <p className="text-slate-400 text-xs max-w-xs">Complete an interview session to unlock AI focus recommendations and review feedback anytime.</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsConfigureModalOpen(true)}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center justify-center gap-1 w-full cursor-pointer"
              >
                <span>Practice Technical Mock Interview</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
