import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { CLIENT_ID, CLIENT_SEC, JWT_EXPIRES_IN, JWT_SECRET } from './env.js';
import { pool, sql } from '../database/SQL.js';

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
            const avatar = photos[0].value;

            let user = await pool.request().input("email", sql.VarChar, email).execute("sp_fetchUserByEMAIL");
            user = user.recordset[0];
            if(!user) {
                user = await pool.request()
                    .input("name", sql.VarChar, displayName)
                    .input("email", sql.VarChar, email)
                    .input("password", sql.VarChar, "noinfoananymous")
                    .input("avatar", sql.VarChar, avatar)
                    .query("INSERT INTO Users (name, email, password, avatar) VALUES (@name, @email, @password, @avatar)");
            }

            const userProf = await pool.request().input("email", sql.VarChar, email).execute("sp_fetchUserByEMAIL");

            const token = jwt.sign({id: userProf.recordset[0].id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
            const newUser = userProf.recordset[0];
            return done(null, {newUser, token});

        } catch (error) {
            return done(error, null);
        }
    })
);

export default passport;