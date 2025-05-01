import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/env.js";


export const authorize = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "Can't perform this action, please login first."});
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: "Token is not valid"});
    }
};