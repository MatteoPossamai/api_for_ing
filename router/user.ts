import express from 'express';
import { getUsers, getUserByEmail, deleteUser, 
    updatePassword, updateData } from '../controller/user';

const userRouter = express.Router();

userRouter.get("/api/user/", getUsers); 
userRouter.get("/api/user/:email", getUserByEmail);
userRouter.put("/api/user/:email", updateData); 
userRouter.put("/api/user/password/:email", updatePassword); 
userRouter.delete("/api/user/:email", deleteUser); 

export default userRouter;