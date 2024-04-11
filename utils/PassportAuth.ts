import * as passportStrategy from "passport-local";
import {PrismaClient} from '@prisma/client';
import bcrypt from "bcryptjs"
import passport from "passport";

const prisma = new PrismaClient();
// Serialization

export const setupPassport = ()=>
{
    passport.serializeUser((user: any, done) => {
        console.log("serialize",user)
        done(null, user.username);
    });

// Deserialization
    passport.deserializeUser(async (username: string, done) => {
        console.log("deserialize",username)
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        done(null, user);
    });

// Local strategy for Passport
    passport.use(new passportStrategy.Strategy(
        {usernameField: "username"}, async (username, password, done) => {
            console.log(passportStrategy.Strategy)
            try {
                if (!username) {
                    return done(null, false)
                }
                const user = await prisma.user.findUnique({
                    where: {
                        username: username
                    }
                });
                console.log("passportStrategy.Strategy",user)
                if (user && user.username === username && await bcrypt.compare(password, user.password)) {
                    console.log("prawidłowy username i hasło",user)
                    return done(null, user);
                } else {
                    console.log("nie prawidłowy username i hasło",user)
                    return done(null, false);
                }
            } catch (e) {
                return done(e);
            }
        }
    ));
}