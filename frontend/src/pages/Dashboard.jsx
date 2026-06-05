import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bot, LineChart, Target, Zap, Clock, Calendar, ChevronRight } from 'lucide-react';
import ConfigureInterviewModal from '../components/modals/ConfigureInterviewModal';
import api from '../utils/api';

const StatCard = ({ title, value, icon, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10 text-cyan-400">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${Number(trend) > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {Number(trend) > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
    <h2 className="text-3xl font-display font-bold text-white mt-1">{value}</h2>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real Data State
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats computation
  const totalInterviews = interviews.length;
  // Reduce total score
  const avgScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc, cur) => acc + cur.score, 0) / totalInterviews) 
    : 0;
  // Crude conversion logic: assume each msg took ~ 30 seconds to answer
  const questionsAnswered = interviews.reduce((acc, cur) => acc + (cur.transcript?.length || 0), 0) / 2;
  const hoursPracticed = (questionsAnswered * 0.5 / 60).toFixed(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interview/history');
        setInterviews(res.data.data);
      } catch (err) {
        console.error("Failed fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <>
      <ConfigureInterviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 text-sm">Here's a breakdown of your true interview metrics.</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <Zap className="w-4 h-4 fill-white flex-shrink-0" />
            Start New Interview
          </button>
        </motion.div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Interviews Completed" value={totalInterviews} icon={<Bot size={20} />} trend={totalInterviews > 0 ? 100 : 0} delay={0.1} />
            <StatCard title="Average Score" value={`${avgScore}%`} icon={<Target size={20} />} trend={avgScore > 50 ? 5 : null} delay={0.2} />
            <StatCard title="Questions Answered" value={Math.floor(questionsAnswered)} icon={<LineChart size={20} />} delay={0.3} />
            <StatCard title="Hours Practiced" value={hoursPracticed} icon={<Clock size={20} />} delay={0.4} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Recent Mocks Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-white">Recent Mocks</h3>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group focus:outline-none">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {loading ? (
               <div className="py-20 flex justify-center"><Bot className="animate-bounce text-gray-800 w-12 h-12" /></div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-800 rounded-xl bg-black/20">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-[0_0_20px_rgba(138,43,226,0.1)]">
                  <Calendar className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-white font-bold mb-2">No interviews yet this week</h4>
                <p className="text-gray-400 text-sm max-w-xs mb-6">You haven't completed any mock interviews recently. Start foraging to build your stats.</p>
                <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-xl border border-white/10 glass text-white text-sm hover:bg-white/5 transition-colors focus:outline-none">
                  Schedule Mock
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 5).map(interview => (
                  <div key={interview._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{interview.role} Interview</h4>
                      <p className="text-xs text-gray-400">{new Date(interview.createdAt).toLocaleDateString()} • {Math.floor((interview.transcript?.length || 0)/2)} Questions</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex-1 sm:hidden h-2 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-cyan-500 rounded-full" style={{width: `${interview.score}%`}} />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-inner ${interview.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {interview.score}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI Recommendations Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="lg:col-span-1 glass-card rounded-2xl border border-white/5 p-6 bg-gradient-to-b from-gray-900/50 to-black"
          >
            <div className="flex items-center gap-2 mb-6 text-purple-400">
              <Target className="w-5 h-5" />
              <h3 className="text-xl font-display font-bold text-white">Focus Areas</h3>
            </div>
            
            <div className="space-y-4">
              {interviews.length > 0 ? (
                // Extract just a quick slice of the latest feedback to keep it dynamic
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-1">Recent Feedback Summary</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono mt-2 pt-2 border-t border-white/10">{interviews[0].feedback.substring(0, 150)}...</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center py-8">
                  <p className="text-xs text-gray-500">Complete an interview to get AI focus recommendations.</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
