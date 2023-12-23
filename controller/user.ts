import express from "express";
import User, {UserType} from "../models/user";
import { passwordChecker } from "../utils/passwordChecker";

// Create new user in signup
export const signUp = (req: express.Request, res: express.Response) => {
    User.findOne({email: req.body.email})
    .then((data: UserType | null) => {
        if (!data) {
            // create it
            if (!passwordChecker(req.body.password)){
                return res.status(400).send('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character');
            }
            const newUser = new User({
                _id: req.body.email + Date.now(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                isBlocked: false
            });

            newUser.save()
            .then((data: UserType) => {
                res.status(201).send(data);
            })
            .catch((err: Error) => {
                console.log(err)
                res.status(500).send('Internal Server Error');
            });

        }else {
            res.status(409).send('User already exists');
        }
    })
    .catch((err: Error) => {
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
};

// Get users
export const getUsers = (req: express.Request, res: express.Response) => {
    User.find()
    .then((data: UserType[]) => {
        res.status(200).send(data);
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Get user by email
export const getUserByEmail = (req: express.Request, res: express.Response) => {
    User.findOne({email: req.params.email})
    .then((data: UserType | null) => {
        if (!data){
            res.status(404).send("User not found");
        }else {
            res.status(200).send(data);
        }
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Delete user by email
export const deleteUser = async (req: express.Request, res: express.Response) => {
    let data = await User.findOne({email: req.params.email}).exec();

    if (!data){
        return res.status(404).send("User not found");
    }else {
        await User.deleteOne({username: req.params.username});
        return res.status(204).send();
    }
};

// Update user data
export const updateData = (req: express.Request, res: express.Response) => {
    User.findOneAndUpdate({email: req.params.email}, req.body, {new: true})
    .then((data: UserType | null) => {
        if (!data){
            res.status(404).send("User not found");
        }else {
            res.status(200).send("User updated");
        }
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
};

export const updatePassword = (req: express.Request, res: express.Response) => {
    User.findOneAndUpdate({email: req.params.email}, {password: req.body.password}, {new: true})
    .then((data: UserType | null) => {
        if (!data){
            res.status(404).send("User not found");
        }else {
            res.status(200).send("User updated");
        }
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
};
