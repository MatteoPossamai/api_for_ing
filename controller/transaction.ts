import express from "express";
import Transaction, {TransactionType} from "../models/transaction";
import Wallet from "../models/wallet";
import Budget from "../models/budget";
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Create new transaction
export const createTransaction = async (req: express.Request, res: express.Response) => {
    try {
        const customObjectId = new ObjectId();
        const newTransaction = new Transaction({
            _id: customObjectId,
            category: req.body.category,
            wallet: req.body.wallet,
            type: req.body.type,
            money: req.body.money,
            description: req.body.description,
            date: new Date(),
            user: req.body.user,
        });
        let wallet = await Wallet.findOne({name: req.body.wallet, user: req.body.user});
        if (!wallet) {
            res.status(404).send('Wallet not found');
        } else {
            let data = await newTransaction.save();
        if (wallet)
        {
            if (req.body.type === 'income') {
             wallet.money += req.body.money;
            }else {
                wallet.money -= req.body.money;
            }
            await wallet.save();
        }

        // Try to search for budgets with the given category
        let budgets = await Budget.find({category: req.body.category, user: req.body.user});
        if (budgets && req.body.type === 'expense') {
            for (let i = 0; i < budgets.length; i++) {
                budgets[i].actualMoney -= req.body.money;
                await budgets[i].save();
            }
        }

        res.status(201).send(data);
        }
    } catch (err: any) {
        // if there are missing fields
        if (err.name === 'ValidationError') {
            res.status(400).send('Bad Request');
        }else {
            res.status(500).send('Internal Server Error');
        }
    }
}

// Get all transactions
export const getTransactions = async (req: express.Request, res: express.Response) => {
    try {
        const data = await Transaction.find();
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

// Get transaction by id
export const getTransactionById = async (req: express.Request, res: express.Response) => {
    try {
        const data = await Transaction.findById(req.params.id);
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send('Transaction not found');
        }
    } catch (err) {
        res.status(404).send('Transaction not found');
    }
}

// Get all transactions by user
export const getTransactionsByUser = async (req: express.Request, res: express.Response) => {
    Transaction.find({user: req.params.name})
    .then((data: TransactionType[]) => {
        res.status(200).send(data);
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Delete transaction by id
export const deleteTransactionById = async (req: express.Request, res: express.Response) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        let wallet = await Wallet.findOne({name: transaction?.wallet, user: transaction?.user});
        if (wallet && transaction) {
            if (transaction.type === 'income') {
                wallet.money -= transaction.money;
            }else {
                wallet.money += transaction.money;
            }
            await wallet.save();
        }
        let budget = await Budget.findOne({category: transaction?.category, user: transaction?.user});
        if (budget && transaction) {
            if (transaction.type === 'income') {
                budget.actualMoney -= transaction.money;
            }else {
                budget.actualMoney += transaction.money;
            }
            await budget.save();
        }
        const data = await Transaction.findByIdAndDelete(req.params.id);
        if (data) {
            res.status(204).send('Transaction deleted');
        } else {
            res.status(404).send('Transaction not found');
        }
    } catch (err) {
        res.status(404).send('Transaction not found');
    }
}

// Update transaction by id
export const updateTransactionById = async (req: express.Request, res: express.Response) => {
    let transaction = await Transaction.findById(req.body._id);
    let wallet = await Wallet.findOne({name: transaction?.wallet, user: transaction?.user});
    if (wallet && transaction) {
        if (transaction.type === 'income') {
            wallet.money -= transaction.money;
        }else {
            wallet.money += transaction.money;
        }
        await wallet.save();
    }
    let category = await Budget.findOne({category: transaction?.category, user: transaction?.user});
    if (category && transaction) {
        if (transaction.type === 'income') {
            category.actualMoney -= transaction.money;
        }else {
            category.actualMoney += transaction.money;
        }
        await category.save();
    }
    Transaction.findByIdAndUpdate(req.body._id, req.body, {new: true})
    .then((data: TransactionType | null) => {
        if (data && wallet) {
            if (data.type === 'income') {
                wallet.money += data.money;
            }
            else {
                wallet.money -= data.money;
            }
            wallet.save();
            if (data && category) {
                if (data.type === 'income') {
                    category.actualMoney += data.money;
                }
                else {
                    category.actualMoney -= data.money;
                }
                category.save();
            }
            res.status(200).send('Transaction updated');
        } else {
            res.status(404).send('Transaction not found');
        }
    })
    .catch((err: Error) => {
        res.status(500).send('Internal Server Error');
    });
}