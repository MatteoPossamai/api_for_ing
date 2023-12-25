import express from "express";
import Wallet, {WalletType} from "../models/wallet";
import Transaction from "../models/transaction";
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Create new wallet
export const createWallet = (req: express.Request, res: express.Response) => {
    Wallet.findOne({name: req.body.name, user: req.body.user})
    .then((data: WalletType | null) => {
        if (!data){
            const customObjectId = new ObjectId();
            let newWallet = new Wallet({
                _id: customObjectId,
                name: req.body.name,
                description: req.body.description,
                money: req.body.money,
                color: req.body.color,
                user: req.body.user,
            });

            newWallet.save()
            .then((data: WalletType) => {
                res.status(201).send(data);
            })
            .catch((err: Error) => {
                if (err.name === 'ValidationError') {
                    res.status(400).send("Bad Request");
                }else {
                    res.status(500).send('Internal Server Error');
                }
            });
        }else {
            res.status(409).send('Wallet name already in use');
        }
    });
};

// Get all wallets
export const getWallets = (_: express.Request, res: express.Response) => {
    Wallet.find()
    .then((data: WalletType[]) => {
        res.status(200).send(data);
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Get all wallets by user
export const getWalletsByUser = (req: express.Request, res: express.Response) => {
    Wallet.find({user: req.params.name})
    .then((data: WalletType[]) => {
        res.status(200).send(data);
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Get wallet by name and user
export const getWallet = (req: express.Request, res: express.Response) => {
    Wallet.findOne({name: req.params.name, user: req.params.user})
    .then((data: WalletType | null) => {
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send('Wallet not found');
        }
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}

// Update wallet by name and user
export const updateWallet = (req: express.Request, res: express.Response) => {    
    Wallet.findOneAndUpdate({name: req.params.name, user: req.body.user}, req.body, {new: true})
        .then((data: WalletType | null) => {
            if (data) {
                res.status(200).send('Wallet updated');
            } else {
                res.status(404).send('Wallet not found');
            }
        })
        .catch((_: Error) => {
            res.status(500).send('Internal Server Error');
        });
}
// Delete wallet by name and user
export const deleteWallet = (req: express.Request, res: express.Response) => {
    Wallet.findOneAndDelete({name: req.params.name, user: req.params.user})
    .then((data: WalletType | null) => {
        if (data) {
            Transaction.deleteMany({wallet: req.params.name, user: req.params.user})
            .then((data: any) => {
            if (data) {
                res.status(204).send('Wallet deleted');
            } else {
                res.status(404).send('Wallet not found');
            }
        })
        } else {
            res.status(404).send('Wallet not found');
        }
        
    })
    .catch((_: Error) => {
        res.status(500).send('Internal Server Error');
    });
}