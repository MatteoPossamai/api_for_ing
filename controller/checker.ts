import express from "express";

import { verifyToken } from "../utils/token";

// Middleware to check auth
export const checker = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(401).send({ 
			success: false,
			message: 'Nessun token fornito'
		});
    }

    let verification = await verifyToken(process.env.SECRET || "secret", token.toString());
    if (!verification) {
        return res.status(401).send({
            success: false,
            message: 'Token non valido'
        });
    }else {
        next();
    }
}