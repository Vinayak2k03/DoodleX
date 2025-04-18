import express from 'express';
import authRouter from './routes/auth';
import roomRouter from "./routes/room";
import chatRouter from "./routes/chat";
import authMiddleware from './middlewares/authMiddleware';
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

app.listen(3001);

