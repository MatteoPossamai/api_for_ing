import express from 'express';
import { createCategory, getCategories, getCategoriesByUser, getCategory, updateCategory, deleteCategory } from '../controller/category';

const categoryRouter = express.Router();

categoryRouter.post('/api/category/', createCategory);
categoryRouter.get('/api/category/', getCategories);
categoryRouter.get('/api/category/user/:name', getCategoriesByUser);
categoryRouter.get('/api/category/:user/:name', getCategory);
categoryRouter.put('/api/category/:name', updateCategory);
categoryRouter.delete('/api/category/:user/:name', deleteCategory);

export default categoryRouter;