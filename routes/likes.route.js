import { Router } from "express";
import { authorize } from "../middlewares/authorization.middleware.js";
import { addLike, fetchLikes, RemoveLike } from "../controllers/likes.controller.js";

const likesRoute = Router();

likesRoute.get('/:id', fetchLikes);

likesRoute.post('/:id', authorize, addLike);

likesRoute.delete('/:id', authorize, RemoveLike);

export default likesRoute;