const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars from root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
// Enable CORS and allow React frontend to connect (Assuming frontend runs on 5173, Vite's default)
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());



// Basic Route for testing
app.get('/', (req, res) => {
  res.send('OrganMatch Node.js API is running...');
});

// Import and use routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donor', require('./routes/donorRoutes'));
app.use('/api/recipient', require('./routes/recipientRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/hospital', require('./routes/hospitalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/report', require('./routes/reportRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
const socket = require('./utils/socket');
socket.init(server);

