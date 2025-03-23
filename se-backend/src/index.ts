import express, { Request, Response, RequestHandler } from 'express';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const connection = new Connection('https://api.devnet.solana.com');


// Get my balance route
app.post('/get-balance', (req: Request, res: Response): void => {
  const { publicKey } = req.body; // Expecting publicKey in the request body
  if (!publicKey) {
    res.status(400).json({ error: 'Public key is required' });
    return;
  }
  connection.getBalance(new PublicKey(publicKey))
    .then((balance: number) => {
      res.json({ balance: balance / LAMPORTS_PER_SOL }); // Return balance in SOL
    })
    .catch((error: Error) => {
      console.error('Error fetching balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    });
});

// Transfer SOL route
app.post('/transfer', (async (req: Request, res: Response) => {
  const { publicKey, receiverPublicKey, amount, sendTransaction } = req.body;

  if (!publicKey || !receiverPublicKey || !amount) {
    return res.status(400).json({ error: 'Sender, receiver, and amount are required' });
  }

  try {
    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(publicKey),
        toPubkey: new PublicKey(receiverPublicKey),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(publicKey);


    const signedTransaction = await sendTransaction(transaction, connection);
    const confirmation = await connection.confirmTransaction(signedTransaction);
    // Serialize the transaction and return it to the client
    const serializedTransaction = transaction.serialize().toString('base64');
    
    res.json({ 
      transaction: serializedTransaction,
      message: "Transaction created successfully"
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
}) as RequestHandler);

// Get transaction cost route
app.post('/get-transaction-cost', (async (req: Request, res: Response) => {
  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: 'Public key is required' });
  }

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(publicKey),
        toPubkey: new PublicKey(publicKey),
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(publicKey);

    const fee = await transaction.getEstimatedFee(connection);
    res.json({ fee: fee !== null ? Number(fee) / LAMPORTS_PER_SOL : 0 });
  } catch (error) {
    console.error('Error estimating fee:', error);
    res.status(500).json({ error: 'Failed to estimate fee' });
  }
}) as RequestHandler);

// Get account info route
app.post('/get-account-info', (async (req: Request, res: Response) => {
  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: 'Public key is required' });
  }

  try {
    const accountInfo = await connection.getAccountInfo(new PublicKey(publicKey));
    
    if (accountInfo) {
      res.json({
        publicKey: publicKey,
        lamports: accountInfo.lamports,
        executable: accountInfo.executable,
        dataLength: accountInfo.data.length,
      });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Failed to fetch account info' });
  }
}) as RequestHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 