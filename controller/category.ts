import express from "express";
import Category, {CategoryType} from "../models/category";

// Create new category
export const createCategory = (req: express.Request, res: express.Response) => {
    Category.findOne({name: req.body.name, user: req.body.user})
    .then((data: CategoryType | null) => {
        if (!data) {
            const newCategory = new Category({
                _id: req.body.name + req.body.user + Date.now(),
                name: req.body.name,
                tags: req.body.tags,
                color: req.body.color,
                user: req.body.user
            });
    
            newCategory.save()
            .then((data: CategoryType) => {
                res.status(201).send(data);
            })
            .catch((err: Error) => {
                if (err.message.includes('duplicate key error')) {
                    res.status(409).send('Category name already in use');
                }else {
                    if (err.name === 'ValidationError') {
                        res.status(400).send('Bad Request');
                    }else{
                        res.status(500).send('Internal Server Error');
                    }
                }
            });
    
        }else {
            res.status(409).send('Category name already in use');
        }
    })
    .catch((err: Error) => {   
        res.status(500).send('Internal Server Error');
    });
};

// Get all categories
export const getCategories = (req: express.Request, res: express.Response) => {
    Category.find()
    .then((data: CategoryType[]) => {
        res.status(200).send(data);
    })
    .catch((err: Error) => {
        
        res.status(500).send('Internal Server Error');
    });
}

// Get all categories by user
export const getCategoriesByUser = (req: express.Request, res: express.Response) => {
    Category.find({user: req.params.name})
    .then((data: CategoryType[]) => {
        res.status(200).send(data);
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Get category by name
export const getCategory = (req: express.Request, res: express.Response) => {
    Category.findOne({name: req.params.name, user: req.params.user})
    .then((data: CategoryType | null) => {
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send('Category not found');
        }
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}


// Update category
export const updateCategory = (req: express.Request, res: express.Response) => {
    Category.findOneAndUpdate({name: req.params.name, user: req.body.user}, req.body, {new: true})
    .then((data: CategoryType | null) => {
        if (data) {
            res.status(200).send('Category updated');
        } else {
            res.status(404).send('Category not found');
        }
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Delete category
export const deleteCategory = (req: express.Request, res: express.Response) => {
    Category.findOneAndDelete({name: req.params.name, user: req.params.user})
    .then((data: CategoryType | null) => {
        if (data) {
            res.status(204).send('Category deleted');
        } else {
            res.status(404).send('Category not found');
        }
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

