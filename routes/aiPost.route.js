import { Router } from "express";
import { authorize } from "../middlewares/authorization.middleware.js";
import { AiPost, GeminiAiGen } from "../controllers/aiPost.controller.js";

const aiPostRouter = Router();

aiPostRouter.post('/generate', authorize, AiPost);

aiPostRouter.post('/gemini', authorize, GeminiAiGen);

export default aiPostRouter;