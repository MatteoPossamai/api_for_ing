import { Schema, model } from 'mongoose';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const schema = new Schema({
    _id : {type:ObjectId, required:true},
    category: {type:String, required:true},
    wallet: {type:String, required:true},
    type: {type: String, enum: ["income", "expense"], required:true},
    money: {type: Number, required:true},
    description: {type: String},
    date: {type: Date, default: Date.now},
    user: {type:String, required:true},
});

interface TransactionType {
    _id : string,
    category: string,
    wallet: string,
    type: string,
    money: number,
    description?: string,
    date: Date,
    user: string,
}

const Transaction = model('Transaction', schema);

export default Transaction;
export type { TransactionType };