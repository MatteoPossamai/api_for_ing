import { generateToken, verifyToken } from "../utils/token";
import { Request, Response } from "express";
import User from "../models/user";

const SECRET = process.env.JWT_SECRET || "secret";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).send("User not found");
    }

    if (user.password !== password) {
        return res.status(401).send("Incorrect credentials");
    }

    var payload = {email: user.email, id: user._id};
    var tkn = generateToken(SECRET, 23200, payload);
    res.setHeader('x-access-token', tkn);
    return res.status(200).json({success: true, token: tkn, id:user._id})
}

export const isLogged = async (req: Request, res: Response) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(401).send("No token provided");
    }

    try {
        const decoded = await verifyToken(SECRET, token.toString());
        return res.status(200).json({ success: true, message: "Valid token", email: decoded.email });
    } catch (error) {
        return res.status(401).send("Invalid token");
    }
}

export const logout = (req: Request, res: Response) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = JSON.stringify(token);

    if (token){
        let payload = {};
        let token = generateToken(SECRET, 5, payload);
        res.setHeader('x-access-token', token);
        return res.status(200).send("You logged out!");
    } else {
        return res.status(200).send("You already logged out!");
    }
}