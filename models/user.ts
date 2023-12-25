import { Schema, model } from 'mongoose';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const schema = new Schema({
    _id : {type:ObjectId, required:true},
    firstName: {type:String, required:true},
    lastName: {type:String, required:true},
    email: {type:String, required:true},
    password: {type:String, required:true},
    isBlocked: {type:Boolean, required:true}
});

const User = model('User', schema);

interface UserType {
    _id : string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    isBlocked: boolean
}

export default User;
export {UserType};