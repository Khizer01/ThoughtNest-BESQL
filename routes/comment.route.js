import { Router } from "express";
import { authorize } from "../middlewares/authorization.middleware.js";
import { createComment, deleteComment, editComments, getComments } from "../controllers/comment.controller.js";

const commentRoute = Router();

commentRoute.post('/', authorize, createComment);

commentRoute.put('/:id', authorize, editComments);

commentRoute.get('/:id', getComments);

commentRoute.delete('/:id', authorize, deleteComment);

export default commentRoute;