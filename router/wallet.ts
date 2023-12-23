import express from 'express';
import { createWallet, getWallet, getWallets, getWalletsByUser, updateWallet, deleteWallet } from '../controller/wallet';

const walletRouter = express.Router();

walletRouter.post('/api/wallet/', createWallet);
walletRouter.get('/api/wallet/', getWallets);
walletRouter.get('/api/wallet/user/:name', getWalletsByUser);
walletRouter.get('/api/wallet/:user/:name', getWallet);
walletRouter.put('/api/wallet/:name', updateWallet);
walletRouter.delete('/api/wallet/:user/:name', deleteWallet);

export default walletRouter;