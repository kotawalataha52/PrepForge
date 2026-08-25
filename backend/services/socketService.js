const { Server } = require('socket.io');
const { OpenAI } = require('openai');

// Runtime memory map for ongoing interviews (interviewId -> systemContext)
const activeInterviewContexts = new Map();
const interviewMessageCounts = new Map();

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
    });

    // Handle Incoming Chat Message
    socket.on('chat_message', async (data) => {
      const { interviewId, message } = data;

      try {
        io.to(interviewId).emit('bot_typing', { isTyping: true });

        const messageCount = (interviewMessageCounts.get(interviewId) || 0) + 1;
        interviewMessageCounts.set(interviewId, messageCount);

        const context = activeInterviewContexts.get(interviewId) || "You are a generic software engineering interviewer. Keep responses to 2 sentences max.";

        const botResponse = await getGeminiResponse(message, context, messageCount === 1);

        io.to(interviewId).emit('bot_typing', { isTyping: false });
        io.to(interviewId).emit('new_message', { sender: 'bot', text: botResponse });

      } catch (error) {
        console.error('Bot Error:', error);
        io.to(interviewId).emit('bot_typing', { isTyping: false });
        io.to(interviewId).emit('new_message', { sender: 'bot', text: 'I encountered an error connecting to the AI. Please check your Gemini API key.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

// Function to call Gemini API (free, fast)
const getGeminiResponse = async (userMessage, systemContext, isFirstMessage = false) => {
  try {
    let systemPrompt = systemContext;

    // Create Gemini client inline (dotenv is already loaded at this point)
    const gemini = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    });

    const completion = await gemini.chat.completions.create({
      model: 'gemini-3.7-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Candidate says: "${userMessage}"\nRespond naturally as the critical interviewer in 3 sentences max.` }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content;

  } catch (err) {
    console.warn('Gemini API unavailable, falling back to mock response:', err.message);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isFirstMessage) {
      const contextSnip = systemContext.includes("resume states") ? "I see your resume here!" : "";
      return `[Mock Mode - Gemini Offline] ${contextSnip} Let's dive in. Can you elaborate on the core technical tradeoffs of your approach?`;
    } else {
      return `That's an interesting approach to "${userMessage}". Could you dive a bit deeper into the why behind that decision?`;
    }
  }
};

module.exports = { initSocket };
