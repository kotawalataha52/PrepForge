const { Server } = require('socket.io');
const { getInterviewBotResponse } = require('./geminiService');

// Runtime memory maps for ongoing interviews
const activeInterviewContexts = new Map(); // interviewId -> systemContext
const interviewMessageCounts = new Map();   // interviewId -> count
const activeInterviewHistories = new Map(); // interviewId -> Array<{ sender: 'candidate'|'bot', text: string }>
const interviewOffTopicStrikes = new Map(); // interviewId -> strike count

/**
 * Detect if candidate message is off-topic nonsense, disinterest, or non-technical deflection
 */
function isCandidateOffTopic(text) {
  if (!text) return false;
  const clean = text.trim().toLowerCase();

  // Code submissions are technical
  if (text.startsWith('[CODE_SUBMISSION') || text.includes('```')) {
    return false;
  }

  // Obvious disinterest / deflection / trolling phrases
  const offTopicPatterns = [
    /not interested/i,
    /other interest/i,
    /not in(to)? this/i,
    /mess(ing)? around/i,
    /joke/i,
    /who are you/i,
    /how are you/i,
    /what('s| is) your (name|favorite|hobby|age)/i,
    /movie/i,
    /weather/i,
    /tell me something/i,
    /sing a song/i,
    /are you (ai|chatgpt|robot|bot|gemini|human)/i,
    /i don'?t (care|wanna|want to answer|feel like)/i,
    /why should i/i,
    /ask me something (else|easy|different)/i,
    /skip (this|question)/i,
    /boring/i,
    /bye\b/i,
    /shut up/i,
    /fool/i,
    /stupid/i,
    /dumb/i,
    /nonsense/i,
    /game/i,
    /play/i,
    /sports/i,
    /cricket/i,
    /football/i
  ];

  if (offTopicPatterns.some(p => p.test(clean))) {
    return true;
  }

  // Conversational questions directed at the AI instead of answering the technical problem
  const isQuestionDirectedAtAI = /^(what|why|who|how|where|when|can you|tell me|do you)\b/i.test(clean) &&
    !/(time complexity|space complexity|approach|algorithm|data structure|big o|runtime|syntax|solution|edge case|tree|graph|array|heap|dp|sql)/i.test(clean);

  if (isQuestionDirectedAtAI && clean.length < 150) {
    return true;
  }

  return false;
}

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // Join Interview Room
    socket.on('join_interview', ({ id, context }) => {
      socket.join(id);
      console.log(`User joined interview room: ${id}`);

      if (context) {
        activeInterviewContexts.set(id, context);
      }
      if (!activeInterviewHistories.has(id)) {
        activeInterviewHistories.set(id, []);
      }
    });

    // Handle Incoming Chat Message (or Code Submission)
    socket.on('chat_message', async (data) => {
      const { interviewId, message, isCode, language } = data;

      try {
        io.to(interviewId).emit('bot_typing', { isTyping: true });

        const messageCount = (interviewMessageCounts.get(interviewId) || 0) + 1;
        interviewMessageCounts.set(interviewId, messageCount);

        const context = activeInterviewContexts.get(interviewId) || "You are a top FAANG Senior Principal Technical Interviewer.";
        const history = activeInterviewHistories.get(interviewId) || [];

        let userPrompt = message;
        if (isCode) {
          userPrompt = `[CODE_SUBMISSION: ${language || 'Code'}]\n${message}`;
        }

        // Check for off-topic / nonsense conduct
        let strikes = interviewOffTopicStrikes.get(interviewId) || 0;
        const offTopic = !isCode && isCandidateOffTopic(message);

        if (offTopic) {
          strikes += 1;
          interviewOffTopicStrikes.set(interviewId, strikes);
        }

        // MORE THAN 2 TIMES (Strike 3) -> AUTOMATIC TERMINATION WITH SCORE 0
        if (strikes > 2) {
          const terminationMsg = "[INTERVIEW TERMINATED - STRIKE 3/2]: You have deviated from the technical interview more than 2 times. As per interview conduct policy, this session has been automatically terminated. Your final score is 0/100 (Strong No Hire).";

          history.push({ sender: 'candidate', text: userPrompt });
          history.push({ sender: 'bot', text: terminationMsg });
          activeInterviewHistories.set(interviewId, history);

          io.to(interviewId).emit('bot_typing', { isTyping: false });
          io.to(interviewId).emit('new_message', { 
            sender: 'bot', 
            text: terminationMsg,
            isTermination: true,
            strikes: 3
          });

          io.to(interviewId).emit('interview_terminated', {
            reason: 'Candidate exceeded maximum off-topic warnings (3 strikes).',
            score: 0,
            finalMessage: terminationMsg
          });
          return;
        }

        let botResponse = '';
        if (strikes === 1 && offTopic) {
          botResponse = `[STRIKE 1/2 WARNING]: You are speaking off-topic or deflecting. This is a formal, timed technical interview for this engineering position. Please focus strictly on the technical problem at hand. Note: Speaking off-topic more than 2 times will automatically terminate your interview with an immediate score of 0. Now, how would you approach solving the technical challenge?`;
        } else if (strikes === 2 && offTopic) {
          botResponse = `[STRIKE 2/2 FINAL WARNING]: You have deviated from the technical problem twice. If your next message is off-topic, uncooperative, or non-technical, your interview will be terminated automatically with an immediate score of 0/100. Please provide your technical solution now.`;
        } else {
          botResponse = await getInterviewBotResponse(
            userPrompt, 
            context, 
            messageCount === 1,
            messageCount,
            history
          );
        }

        // Record turn in session history to prevent repeating questions
        history.push({ sender: 'candidate', text: userPrompt });
        history.push({ sender: 'bot', text: botResponse });
        activeInterviewHistories.set(interviewId, history);

        io.to(interviewId).emit('bot_typing', { isTyping: false });
        io.to(interviewId).emit('new_message', { 
          sender: 'bot', 
          text: botResponse,
          isCodeReview: !!isCode,
          strikes
        });

      } catch (error) {
        console.error('Bot Error:', error);
        io.to(interviewId).emit('bot_typing', { isTyping: false });
        io.to(interviewId).emit('new_message', {
          sender: 'bot',
          text: "I encountered a brief connection issue while evaluating. Could you please repeat or resubmit your approach?"
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
