import express from 'express';
import Web3 from 'web3';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
app.use(express.json());

// Serve static files from the public directory (where your HTML and script files are located)
app.use(express.static(path.join(__dirname, 'public')));

// Set up Web3 connection to the blockchain
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GANACHE_URL || 'http://127.0.0.1:7545'));

// Load the contract ABI and address from your compiled contract JSON file
const contractPath = path.resolve(__dirname, '../agri_supplychain/build/contracts/SupplyChain.json');
const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));

// Set up the contract instance
const contract = new web3.eth.Contract(contractData.abi, process.env.CONTRACT_ADDRESS);

// Set up the account with the private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Route to add a product
app.post('/addProduct', async (req, res) => {
    const { name, origin, price } = req.body;

    if (!name || !origin || !price) {
        return res.status(400).json({ error: "Missing product data." });
    }

    try {
        const weiPrice = web3.utils.toWei(price, 'ether'); // Convert price to Wei
        const gasEstimate = await contract.methods.addProduct(name, origin, weiPrice).estimateGas({ from: web3.eth.defaultAccount });
        
        const receipt = await contract.methods.addProduct(name, origin, weiPrice).send({
            from: web3.eth.defaultAccount,
            gas: gasEstimate,
        });
        
        res.json({
            status: 'Product added!',
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to buy a product
// Route to buy a product from the blockchain
app.post("/buyProduct", async (req, res) => {
    const { productId } = req.body;

    try {
        const accounts = await web3.eth.getAccounts();
        const product = await contract.methods.products(productId).call();
        const price = product.price;

        // Assuming buyProduct method in contract and requiring ETH for purchase
        const receipt = await contract.methods.buyProduct(productId).send({
            from: accounts[0],
            value: price,
            gas: 2000000,
        });

        // Send the transaction hash to the frontend
        res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error("Error buying product:", error);
        res.status(500).json({ error: error.message });
    }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
