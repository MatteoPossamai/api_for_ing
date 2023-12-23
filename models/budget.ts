import { Schema, model } from 'mongoose';

const schema = new Schema({
    _id : {type:String},
    name: {type:String, required:true},
    description: {type: String},
    initialMoney: {type: Number, required:true},
    actualMoney: {type: Number, required:true},
    category: {type: String, required:true},
    user: {type:String, required:true},
});

interface BudgetType {
    _id : string,
    name: string,
    description?: string,
    initialMoney: number,
    actualMoney: number,
    category: string,
    user: string,
}

const Budget = model('Budget', schema);

export default Budget;

export { BudgetType };