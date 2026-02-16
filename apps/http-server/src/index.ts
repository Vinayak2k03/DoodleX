import express from 'express';
import authRouter from './routes/auth.js';
import roomRouter from "./routes/room.js";
import chatRouter from "./routes/chat.js";
import authMiddleware from './middlewares/authMiddleware.js';
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(cookieParser());

app.use(cors({
    origin:"*",
    credentials:true
}))


app.use("/api/v1/auth",authRouter);
app.use("/api/v1/rooms",authMiddleware,roomRouter);
app.use("/api/v1/chat",authMiddleware,chatRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

