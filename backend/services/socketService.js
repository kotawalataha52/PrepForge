const { Server } = require('socket.io');
const { getInterviewBotResponse } = require('./geminiService');

// Runtime memory maps for ongoing interviews
const activeInterviewContexts = new Map(); // interviewId -> systemContext
const interviewMessageCounts = new Map();   // interviewId -> count
const activeInterviewHistories = new Map(); // interviewId -> Array<{ sender: 'candidate'|'bot', text: string }>

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

        const botResponse = await getInterviewBotResponse(
          userPrompt, 
          context, 
          messageCount === 1,
          messageCount,
          history
        );

        // Record turn in session history to prevent repeating questions
        history.push({ sender: 'candidate', text: userPrompt });
        history.push({ sender: 'bot', text: botResponse });
        activeInterviewHistories.set(interviewId, history);

        io.to(interviewId).emit('bot_typing', { isTyping: false });
        io.to(interviewId).emit('new_message', { 
          sender: 'bot', 
          text: botResponse,
          isCodeReview: !!isCode
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
