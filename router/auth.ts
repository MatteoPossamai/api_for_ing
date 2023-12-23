import express from 'express';
import { login, isLogged, logout } from '../controller/auth';
import { signUp } from '../controller/user';

const authRouter = express.Router();

authRouter.post('/login', login); 
authRouter.post('/isLogged', isLogged); 
authRouter.post('/logout', logout); 
authRouter.post('/signup', signUp); 

export default authRouter;