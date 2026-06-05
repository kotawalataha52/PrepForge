require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); 
app.use(helmet());
app.use(morgan('dev'));

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('[DEBUG] Incoming POST to', req.path);
    console.log('Content-Type:', req.headers['content-type']);
  }
  next();
});

// Init WebSockets
initSocket(server);

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));

// Root endpoint just to test API is up
app.get('/', (req, res) => res.send('PrepForge API Running'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
