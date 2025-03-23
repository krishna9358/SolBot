"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web3_js_1 = require("@solana/web3.js");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Middleware to parse JSON requests
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const connection = new web3_js_1.Connection('https://api.devnet.solana.com');
// Get my balance route
app.post('/get-balance', (req, res) => {
    const { publicKey } = req.body; // Expecting publicKey in the request body
    if (!publicKey) {
        res.status(400).json({ error: 'Public key is required' });
        return;
    }
    connection.getBalance(new web3_js_1.PublicKey(publicKey))
        .then((balance) => {
        res.json({ balance: balance / web3_js_1.LAMPORTS_PER_SOL }); // Return balance in SOL
    })
        .catch((error) => {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    });
});
// Transfer SOL route
app.post('/transfer', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, receiverPublicKey, amount, sendTransaction } = req.body;
    if (!publicKey || !receiverPublicKey || !amount) {
        return res.status(400).json({ error: 'Sender, receiver, and amount are required' });
    }
    try {
        // Create the transaction
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: new web3_js_1.PublicKey(publicKey),
            toPubkey: new web3_js_1.PublicKey(receiverPublicKey),
            lamports: amount * web3_js_1.LAMPORTS_PER_SOL,
        }));
        // Get the latest blockhash
        const { blockhash } = yield connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new web3_js_1.PublicKey(publicKey);
        const signedTransaction = yield sendTransaction(transaction, connection);
        const confirmation = yield connection.confirmTransaction(signedTransaction);
        // Serialize the transaction and return it to the client
        const serializedTransaction = transaction.serialize().toString('base64');
        res.json({
            transaction: serializedTransaction,
            message: "Transaction created successfully"
        });
    }
    catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: 'Failed to create transfer' });
    }
})));
// Get transaction cost route
app.post('/get-transaction-cost', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey } = req.body;
    if (!publicKey) {
        return res.status(400).json({ error: 'Public key is required' });
    }
    try {
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: new web3_js_1.PublicKey(publicKey),
            toPubkey: new web3_js_1.PublicKey(publicKey),
            lamports: 0.1 * web3_js_1.LAMPORTS_PER_SOL,
        }));
        const { blockhash } = yield connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new web3_js_1.PublicKey(publicKey);
        const fee = yield transaction.getEstimatedFee(connection);
        res.json({ fee: fee !== null ? Number(fee) / web3_js_1.LAMPORTS_PER_SOL : 0 });
    }
    catch (error) {
        console.error('Error estimating fee:', error);
        res.status(500).json({ error: 'Failed to estimate fee' });
    }
})));
// Get account info route
app.post('/get-account-info', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey } = req.body;
    if (!publicKey) {
        return res.status(400).json({ error: 'Public key is required' });
    }
    try {
        const accountInfo = yield connection.getAccountInfo(new web3_js_1.PublicKey(publicKey));
        if (accountInfo) {
            res.json({
                publicKey: publicKey,
                lamports: accountInfo.lamports,
                executable: accountInfo.executable,
                dataLength: accountInfo.data.length,
            });
        }
        else {
            res.status(404).json({ error: 'Account not found' });
        }
    }
    catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({ error: 'Failed to fetch account info' });
    }
})));
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
