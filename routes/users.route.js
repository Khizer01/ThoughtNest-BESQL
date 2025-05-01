import { Router } from "express";
import { editUser } from "../controllers/users.controller.js";
import { authorize } from "../middlewares/authorization.middleware.js";


const UsersRoute = Router();

UsersRoute.put('/:id', authorize, editUser);

export default UsersRoute;