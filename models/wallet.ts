import { Schema, model } from 'mongoose';

const schema = new Schema({
    _id : {type:String},
    name: {type:String, required:true},
    description: {type: String},
    money: {type: Number, required:true},
    color: {type:String},
    user: {type:String, required:true},
});

interface WalletType {
    _id : string,
    name: string,
    description?: string,
    money: number,
    color?: string,
    user: string,
}

const Wallet = model('Wallet', schema);

export default Wallet;
export type { WalletType };