import e from 'express';
import { Schema, model } from 'mongoose';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const schema = new Schema({
    _id : {type:ObjectId, required:true},
    name: {type:String, required:true},
    tags: {type: [String]},
    user: {type:String, required:true},
});

interface CategoryType {
    _id : string,
    name: string,
    tags: string[],
    user: string,
}

const Category = model('Category', schema);

export default Category;
export type {CategoryType};