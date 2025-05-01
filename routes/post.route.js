import { Router } from "express";
import { authorize } from "../middlewares/authorization.middleware.js";
import { createPost, deletePost, editPost, getAllPosts, getPost } from "../controllers/post.controller.js";

const postRoute = Router();

postRoute.post('/', authorize, createPost);

postRoute.put('/:id', authorize, editPost);

postRoute.delete('/:id', authorize, deletePost);

postRoute.get('/:id', getPost);

postRoute.get('/', getAllPosts);

export default postRoute;