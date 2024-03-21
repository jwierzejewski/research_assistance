import {Request, Response, NextFunction} from 'express';
import {Prisma} from "@prisma/client";

const errorHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
        .catch((err: Error) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(err.code, err.message)
            } else {
                console.log(err.message)
            }
            return res.status(500).json({error: 'Server error'});
        });
};

export default errorHandler;