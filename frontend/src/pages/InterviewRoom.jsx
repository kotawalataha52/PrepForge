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
  MoreVertical,
  Maximize,
  Bot,
  Loader2
} from 'lucide-react';
import api from '../utils/api';
import InterviewFeedbackModal from '../components/modals/InterviewFeedbackModal';
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
  
  const { isListening, toggleListening, speakText, stopSpeaking } = useSpeech((spokenText) => {
    // Live update the text box with native STT
    setInput(spokenText);
  });

  // Feedback Modal State
  const [isEnding, setIsEnding] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // Pluck the context stored by ConfigureInterviewModal out of the router statetree
  const systemContext = location.state?.context;

  const chatEndRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isBotTyping]);

  useEffect(() => {
    if (socket && user) {
      // Announce presence to backend room passing in the hidden context!
      socket.emit('join_interview', { id, context: systemContext });

      // Welcome message from AI
      const welcome = "Hello! I'm your AI interviewer today. Based on your uploaded resume, I'm analyzing your projected skills. Whenever you're ready, let's start with a brief introduction.";
      setMessages([
        { id: 1, sender: 'bot', text: welcome }
      ]);
      // Optional auto-play depending on browser policy
      speakText(welcome);

      // Connect listeners
      socket.on('new_message', (data) => {
        setMessages((prev) => [...prev, { id: Date.now(), sender: data.sender, text: data.text }]);
        // Speak the incoming bot message loud!
        if (data.sender === 'bot') {
          speakText(data.text);
        }
      });

      socket.on('bot_typing', ({ isTyping }) => {
        setIsBotTyping(isTyping);
      });

      return () => {
        socket.off('new_message');
        socket.off('bot_typing');
      };
    }
  }, [socket, id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '' || !socket) return;

    const newMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    
    // Fire WebSockets payload
    socket.emit('chat_message', { interviewId: id, message: input });
    setInput('');
  };

  const endInterview = async () => {
    if (messages.length < 2) {
      // Avoid uploading completely blank interviews
      navigate('/dashboard');
      return;
    }

    setIsEnding(true);
    
    try {
      stopSpeaking(); // Cut off the AI if they are still talking
      
      // Map the messages exactly as the backend expects -> transcript: [{sender, text}]
      const transcript = messages.map(msg => ({ sender: msg.sender, text: msg.text }));
      
      const response = await api.post('/interview/finish', {
        transcript,
        mockId: id,
        role: "Software Engineer" // Depending on complexity, you could pass this via location.state too
      });

      // The backend returns the newly created DB document
      setFeedbackData(response.data.data);
      
    } catch (error) {
      console.error('Failed to end interview:', error);
      navigate('/dashboard'); // Fallback if server crashes
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      
      <InterviewFeedbackModal isOpen={!!feedbackData} feedbackData={feedbackData} />

      {/* Loading Overlay when grading */}
      <AnimatePresence>
        {isEnding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-xl font-display font-bold text-white tracking-widest">ANALYZING TRANSCRIPT</p>
            <p className="text-gray-400 text-sm mt-2">Our AI is grading your performance...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Video / Avatar Area */}
      <div className="flex-1 hidden lg:flex flex-col relative border-r border-white/5 bg-gradient-to-br from-gray-900 via-black to-black p-6">
        {/* Top bar internal to left panel */}
        <div className="flex justify-between items-center z-10">
          <div className="px-4 py-1.5 rounded-full glass border border-white/10 text-sm font-medium text-cyan-400">
             Session Recoding • Live
          </div>
          <button className="p-2 text-gray-400 hover:text-white transition focus:outline-none">
            <Maximize size={20} />
          </button>
        </div>

        {/* The AI Avatar Space */}
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
           {/* Glow behind bot */}
          <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full" />
           
          {isBotTyping ? (
             <motion.div 
               animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(0,240,255,0)", "0 0 40px rgba(0,240,255,0.4)", "0 0 0 rgba(0,240,255,0)"] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-48 h-48 rounded-full bg-gray-900 border border-cyan-500/50 flex flex-col items-center justify-center z-10 glass-card"
             >
                <Bot className="w-16 h-16 text-cyan-400 mb-2" />
                <span className="text-cyan-400 font-bold text-sm uppercase tracking-widest">Listening</span>
             </motion.div>
          ) : (
            <div className="w-48 h-48 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center z-10 shadow-2xl">
               <Bot className="w-16 h-16 text-gray-500" />
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 z-10 pointer-events-auto">
           <button 
             onClick={toggleListening}
             className={`w-14 h-14 rounded-full border border-white/10 flex items-center justify-center transition focus:outline-none ${isListening ? 'bg-red-500/80 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-gray-800 hover:bg-gray-700'}`}
             title={isListening ? "Stop Listening" : "Start Voice Input"}
           >
             <Mic className="w-6 h-6 text-white" />
           </button>
           <button className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 border border-white/10 flex items-center justify-center transition focus:outline-none cursor-not-allowed opacity-50">
             <Video className="w-6 h-6 text-white" />
           </button>
           <button 
             onClick={endInterview}
             className="w-14 h-14 rounded-full bg-red-500/80 hover:bg-red-500 border border-red-400 flex items-center justify-center transition shadow-[0_0_15px_rgba(239,68,68,0.4)] focus:outline-none"
             title="End Interview"
           >
             <PhoneOff className="w-6 h-6 text-white" />
           </button>
        </div>
      </div>

      {/* RIGHT PANEL: Chat Area */}
      <div className="w-full lg:w-[450px] flex flex-col bg-[var(--color-background-dark)] relative z-20">
        
        {/* Header */}
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 glass">
          <div>
            <h2 className="font-display font-bold text-lg text-white">Full Stack Engineering</h2>

          </div>

        </div>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shrink-0 mb-1">
                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                  </div>
                )}
                <div 
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm' 
                      : 'bg-gray-800 text-gray-200 border border-white/5 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isBotTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-gray-500 text-sm ml-10">
               <LoaderDots />
             </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Keyboard Input */}
        <div className="p-4 bg-gray-900/50 border-t border-white/5">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

// Animated 3 dots loader
const LoaderDots = () => {
  return (
    <div className="flex space-x-1 p-2 bg-gray-800 rounded-2xl rounded-bl-sm border border-white/5">
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
    </div>
  );
};

export default InterviewRoom;
