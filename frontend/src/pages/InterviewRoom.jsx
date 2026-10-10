import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Mic, 
  Video, 
  PhoneOff, 
  Send,
  Bot,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Code2,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import InterviewFeedbackModal from '../components/modals/InterviewFeedbackModal';
import CodeEditorPanel from '../components/interview/CodeEditorPanel';
import { useSpeech } from '../hooks/useSpeech';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  
  const { isListening, toggleListening, speakText, stopSpeaking } = useSpeech((spokenText) => {
    setInput(spokenText);
  });

  const [isEnding, setIsEnding] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [strikes, setStrikes] = useState(0);
  
  const systemContext = location.state?.context;
  const targetRole = location.state?.role || "Software Engineer";

  const chatEndRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isBotTyping]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_interview', { id, context: systemContext });

      const welcome = `Welcome to your technical mock interview for the ${targetRole} role. We'll be exploring system architecture from your background, core Computer Science fundamentals (OS, DBMS, Networks), and DSA problem solving. Whenever you're ready, let's start with a brief overview of your technical background and your most technically demanding project.`;
      
      setMessages([
        { id: 1, sender: 'bot', text: welcome }
      ]);
      
      if (!isMuted) {
        speakText(welcome);
      }

      socket.on('new_message', (data) => {
        if (typeof data.strikes === 'number') {
          setStrikes(data.strikes);
        }

        setMessages((prev) => [
          ...prev, 
          { 
            id: Date.now(), 
            sender: data.sender, 
            text: data.text, 
            isCode: data.isCode,
            language: data.language,
            isCodeReview: data.isCodeReview
          }
        ]);
        if (data.sender === 'bot' && !isMuted) {
          speakText(data.text);
        }
        setIsSubmittingCode(false);
      });

      socket.on('interview_terminated', async (data) => {
        setStrikes(3);
        stopSpeaking();
        setIsEnding(true);

        try {
          const currentTranscript = messagesRef.current.map(m => ({ sender: m.sender, text: m.text }));
          if (data?.finalMessage && !currentTranscript.some(m => m.text === data.finalMessage)) {
            currentTranscript.push({ sender: 'bot', text: data.finalMessage });
          }

          const response = await api.post('/interview/finish', {
            transcript: currentTranscript,
            mockId: id,
            role: targetRole,
            isTerminated: true
          });

          setFeedbackData(response.data?.data);
        } catch (err) {
          console.error('Failed to finish terminated interview:', err);
          setFeedbackData({
            overallScore: 0,
            feedback: "Interview automatically terminated due to excessive off-topic remarks (exceeded 2 strikes). Candidate failed to focus on the technical assessment.",
            recommendation: "Strong No Hire",
            scores: { technical: 0, communication: 0, problemSolving: 0 },
            strengths: [],
            improvements: [
              "Conduct violation: Candidate repeatedly deflected or spoke off-topic during a formal interview.",
              "Prepare to answer technical fundamentals directly and professionally."
            ],
            suggestedTopics: ["Professional Interview Etiquette", "Core Technical Topics"]
          });
        } finally {
          setIsEnding(false);
        }
      });

      socket.on('bot_typing', ({ isTyping }) => {
        setIsBotTyping(isTyping);
      });

      return () => {
        socket.off('new_message');
        socket.off('interview_terminated');
        socket.off('bot_typing');
      };
    }
  }, [socket, id]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (input.trim() === '' || !socket) return;

    const newMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    
    socket.emit('chat_message', { interviewId: id, message: input });
    setInput('');
  };

  // Submit code from the Live Code Editor directly to the AI Interviewer
  const handleCodeSubmit = ({ code, language }) => {
    if (!socket || !code.trim()) return;
    setIsSubmittingCode(true);

    const userMessageText = `[Submitted ${language} Code Solution]:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
    
    const newMsg = { 
      id: Date.now(), 
      sender: 'user', 
      text: userMessageText, 
      isCode: true,
      rawCode: code,
      language 
    };

    setMessages((prev) => [...prev, newMsg]);

    socket.emit('chat_message', {
      interviewId: id,
      message: code,
      isCode: true,
      language
    });
  };

  const endInterview = async () => {
    if (messages.length < 2) {
      navigate('/dashboard');
      return;
    }

    setIsEnding(true);
    
    try {
      stopSpeaking();
      const transcript = messages.map(msg => ({ sender: msg.sender, text: msg.text }));
      
      const response = await api.post('/interview/finish', {
        transcript,
        mockId: id,
        role: targetRole
      });

      setFeedbackData(response.data?.data);
    } catch (error) {
      console.error('Failed to end interview:', error);
      navigate('/dashboard');
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#07080C] text-white overflow-hidden relative">
      
      <InterviewFeedbackModal 
        isOpen={!!feedbackData} 
        feedbackData={feedbackData} 
        onClose={() => navigate('/dashboard')}
      />

      {/* Loading Overlay when grading */}
      <AnimatePresence>
        {isEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <p className="text-xl font-display font-bold text-white tracking-tight">Evaluating Interview Transcript</p>
            <p className="text-gray-400 text-xs mt-1.5 max-w-sm">Our AI is computing your technical precision, code quality, and algorithm tradeoffs...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Ambient Avatar & Audio Space (Hidden or compact when code editor is open) */}
      <div className={`hidden lg:flex flex-col relative border-r border-white/5 bg-gradient-to-b from-[#0C0E17] to-[#07080C] p-6 justify-between transition-all duration-300 ${
        isCodeEditorOpen ? 'w-[320px]' : 'flex-1 p-8'
      }`}>
        
        {/* Top session indicators */}
        <div className="flex justify-between items-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="truncate max-w-[180px]">{targetRole}</span>
          </div>

          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopSpeaking();
            }}
            className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* The AI Avatar Space */}
        <div className="flex flex-col items-center justify-center my-auto relative">
          <div className="absolute w-[280px] h-[280px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />
           
          {isBotTyping ? (
            <motion.div 
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-3xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col items-center justify-center z-10 glass-card shadow-2xl ${
                isCodeEditorOpen ? 'w-32 h-32' : 'w-40 h-40'
              }`}
            >
              <Bot className={`${isCodeEditorOpen ? 'w-9 h-9' : 'w-12 h-12'} text-indigo-400 mb-1.5`} />
              <span className="text-indigo-300 font-semibold text-[11px] tracking-wider uppercase">Evaluating...</span>
            </motion.div>
          ) : (
            <div className={`rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl ${
              isCodeEditorOpen ? 'w-32 h-32' : 'w-40 h-40'
            }`}>
              <Bot className={`${isCodeEditorOpen ? 'w-9 h-9' : 'w-12 h-12'} text-gray-400 mb-1.5`} />
              <span className="text-gray-400 text-xs font-medium">Interviewer Active</span>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="flex flex-col gap-2.5 z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleListening}
              className={`flex-1 py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isListening 
                  ? 'bg-rose-500/80 hover:bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30' 
                  : 'glass hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? "Listening..." : "Voice Input"}</span>
            </button>

            <button
              onClick={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
              className={`px-3.5 py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isCodeEditorOpen 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' 
                  : 'glass hover:bg-white/10 border-white/10 text-indigo-300 hover:text-white'
              }`}
              title="Toggle Live Code Editor"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isCodeEditorOpen ? 'Hide Code' : 'Code Editor'}</span>
            </button>
          </div>

          <button 
            onClick={endInterview}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End & Grade Session</span>
          </button>
        </div>
      </div>

      {/* CENTER: Collapsible Live Code Editor Panel */}
      <AnimatePresence>
        {isCodeEditorOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 flex flex-col min-w-[380px] md:min-w-[500px] lg:min-w-[620px] overflow-hidden z-30"
          >
            <CodeEditorPanel 
              onSubmitCode={handleCodeSubmit}
              onClose={() => setIsCodeEditorOpen(false)}
              isSubmitting={isSubmittingCode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT PANEL: Chat Area */}
      <div className={`flex flex-col bg-[#0B0D14] border-l border-white/5 relative z-20 transition-all duration-300 ${
        isCodeEditorOpen ? 'w-full lg:w-[420px]' : 'w-full lg:w-[480px]'
      }`}>
        
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 glass">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xs md:text-sm text-white">{targetRole}</h2>
              {strikes > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  strikes >= 3 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : strikes === 2 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {strikes >= 3 ? 'Terminated' : `${strikes}/2 Strikes`}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">DSA & Technical Discussion</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isCodeEditorOpen 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isCodeEditorOpen ? 'Close Code' : 'Open Code Editor'}</span>
            </button>

            <button 
              onClick={endInterview}
              className="lg:hidden px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
            >
              End
            </button>
          </div>
        </div>

        {/* Conduct Warning Banner if candidate has off-topic strikes */}
        <AnimatePresence>
          {strikes > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mx-4 mt-3 p-3 rounded-xl border flex items-start gap-2.5 text-xs shadow-sm ${
                strikes >= 3
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : strikes === 2
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${strikes >= 3 ? 'text-rose-400' : 'text-amber-400'}`} />
              <div className="flex-1">
                <p className="font-semibold text-[11px] uppercase tracking-wide">
                  {strikes >= 3
                    ? 'Interview Terminated — Exceeded Conduct Limit'
                    : `Conduct Warning: Strike ${strikes} of 2`}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                  {strikes >= 3
                    ? 'Session was terminated due to repeated off-topic remarks. Score recorded as 0/100 (Strong No Hire).'
                    : strikes === 2
                    ? 'Final warning! Talking off-topic, deflecting, or asking the AI questions again will automatically terminate the interview with an immediate score of 0/100.'
                    : 'Please keep your responses strictly technical. Deviating off-topic more than 2 times automatically terminates the interview with a score of 0.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[92%]">
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                    <Bot size={13} />
                  </div>
                )}
                
                {msg.isCode ? (
                  /* Code Submission Bubble */
                  <div className="bg-[#090B12] border border-indigo-500/30 rounded-xl p-3.5 text-xs text-gray-200 w-full space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-300 pb-1.5 border-b border-white/5 font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <Code2 className="w-3 h-3 text-indigo-400" />
                        Candidate {msg.language || 'Code'} Submission
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sent to AI
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] text-emerald-300 bg-black/50 p-2.5 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">
                      {msg.rawCode || msg.text}
                    </pre>
                  </div>
                ) : (
                  /* Standard Dialogue Bubble */
                  <div 
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' 
                        : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isBotTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-gray-500 text-xs ml-8">
              <LoaderDots />
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Keyboard Input */}
        <div className="p-3.5 bg-black/40 border-t border-white/5">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type explanation or response..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-3.5 pr-11 py-3 focus:outline-none focus:border-indigo-500 transition text-xs text-white placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={13} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

const LoaderDots = () => {
  return (
    <div className="flex space-x-1 p-1.5 bg-white/5 rounded-xl border border-white/5">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
    </div>
  );
};

export default InterviewRoom;
