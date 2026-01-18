import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for React frontend - allow all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));
}

// Test endpoint to verify proxy is working
app.get('/test', (req, res) => {
    console.log('✅ /test endpoint hit!');
    res.json({ message: 'Backend is working!', timestamp: Date.now() });
});

// Route for text generation
app.post('/generate', async (req, res) => {
    console.log('🎯 /generate endpoint hit!');
    console.log('📨 Request body:', req.body);
    await handler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/generate`);
    console.log(`🔑 HF_TOKEN loaded: ${process.env.HF_TOKEN ? 'Yes ✓' : 'No ✗'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

