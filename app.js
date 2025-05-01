import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { PORT, URL } from './configs/env.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import AuthRoute from './routes/auth.route.js';
import UsersRoute from './routes/users.route.js';
import connectDB from './database/Mongo.js';
import passport from './configs/passport.js';
import postRoute from './routes/post.route.js';
import commentRoute from './routes/comment.route.js';
import cors from 'cors';
import aiPostRouter from './routes/aiPost.route.js';

var app = express();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  limit: 25,
  message: "Too many requests, please try again after 5 minutes"
})

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(limiter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(passport.initialize());

app.use(`${URL}/auth`, AuthRoute);
app.use(`${URL}/users`, UsersRoute);
app.use(`${URL}/post`, postRoute);
app.use(`${URL}/comment`, commentRoute);
app.use(`${URL}/ai`, aiPostRouter);

app.listen(PORT, async()=> {
  console.log(`Server running on Port: ${PORT}`);
  await connectDB();
})

export default app;
