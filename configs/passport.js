import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { CLIENT_ID, CLIENT_SEC, JWT_EXPIRES_IN, JWT_SECRET } from './env.js';
import User from '../models/user.model.js';

passport.use(
    new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SEC,
        callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const {id, displayName, emails, photos} = profile;
            const email = emails[0].value;
            const picture = photos[0].value;

            let user = await User.findOne({email: email});
            if(!user) {
                user = new User({
                    name: displayName,
                    email: email,
                    password: id,
                    avatar: picture,
                });
                await user.save();
            }

            const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

            return done(null, {user, token});

        } catch (error) {
            return done(error, null);
        }
    })
);

export default passport;