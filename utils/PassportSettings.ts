import * as passportStrategy from "passport-local";
import {PrismaClient} from '@prisma/client';
import bcrypt from "bcryptjs"
import passport from "passport";

const prisma = new PrismaClient();

export const setupPassport = () => {
    passport.serializeUser((user: any, done) => {
        done(null, user.username);
    });

    passport.deserializeUser(async (username: string, done) => {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        done(null, user);
    });

    passport.use(new passportStrategy.Strategy({usernameField: "username"}, async (username, password, done) => {
        try {
            if (!username) {
                return done(null, false)
            }
            const user = await prisma.user.findUnique({
                where: {
                    username: username
                }
            });
            if (user && user.username === username && await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }
    }));
}