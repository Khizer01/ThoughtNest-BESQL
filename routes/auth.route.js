import { Router } from "express";
import { ForgotPassword, getForgotPass, SignIn, SignUp } from "../controllers/auth.controller.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import passport from "passport";

const AuthRoute = Router();

AuthRoute.post('/sign-up', SignUp );

AuthRoute.get('/google', passport.authenticate('google', {scope: ["profile", "email"]}));

AuthRoute.get("/google/callback", passport.authenticate('google', { session: false }), (req, res) => {
    const { token, user } = req.user;
    const name = encodeURIComponent(user.name);
    const email = encodeURIComponent(user.email);
    const id = encodeURIComponent(user._id);
    
    res.redirect(`http://localhost:5173/?token=${token}&name=${name}&email=${email}&id=${id}`);
});

AuthRoute.post('/sign-in', SignIn );

AuthRoute.post('/forgotPass', getForgotPass );

AuthRoute.post('/setforgotpass/:id', ForgotPassword );

export default AuthRoute;