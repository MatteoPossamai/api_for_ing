import express from 'express';
import { createBudget, getBudgets,getBudgetsByUser, getBudget, updateBudget, deleteBudget } from '../controller/budget';

const budgetRouter = express.Router();

budgetRouter.post('/api/budget/', createBudget);
budgetRouter.get('/api/budget/', getBudgets);
budgetRouter.get('/api/budget/user/:name', getBudgetsByUser);
budgetRouter.get('/api/budget/:user/:name', getBudget);
budgetRouter.put('/api/budget/:name', updateBudget);
budgetRouter.delete('/api/budget/:user/:name', deleteBudget);

export default budgetRouter;