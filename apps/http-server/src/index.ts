import express from 'express';
import authRouter from './routes/auth';
import roomRouter from "./routes/room";
import chatRouter from "./routes/chat";
import authMiddleware from './middlewares/authMiddleware';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Add verbose logging
console.log('Starting HTTP server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');

app.use(express.json());
app.use(cookieParser());

// Log all requests 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Configure CORS
app.use(cors({
  origin: ["https://doodlex.vinayaknagar.tech", "http://localhost:3000"],
  credentials: true
}));

// Add a test endpoint
app.get('/api/v1/health', (req, res) => {
  console.log('Health endpoint hit');
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Register routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rooms", authMiddleware, roomRouter);
app.use("/api/v1/chat", authMiddleware, chatRouter);

// Error handling
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend HTTP server listening on port ${PORT}`);
});
