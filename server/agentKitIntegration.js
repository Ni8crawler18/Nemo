import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const NILLION_NODES = [
    "https://nildb-zy8u.nillion.network",
    "https://nildb-rl5g.nillion.network",
    "https://nildb-lpjp.nillion.network"
];

const localStorage = {};

async function storeOnNillion(data) {
    return { success: true, message: "Data stored on Nillion" };
}

async function retrieveFromNillion(schema) {
    return localStorage[schema] || null;
}

app.post('/store-agent-data', async (req, res) => {
    try {
        const { _id, agent_name, api_key, task_log } = req.body;
        if (!_id || !agent_name || !api_key || !Array.isArray(task_log) || task_log.length < 1) {
            return res.status(400).json({ error: "Invalid request format" });
        }
        const schema = uuidv4();
        localStorage[schema] = { _id, agent_name, api_key, schema, task_log };
        await storeOnNillion(localStorage[schema]);
        res.json({ success: true, message: "Agent data stored successfully", schema });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

app.get('/get-agent-data/:schema', async (req, res) => {
    try {
        const agentData = await retrieveFromNillion(req.params.schema);
        if (!agentData) {
            return res.status(404).json({ error: "No data found" });
        }
        res.json({ success: true, agentData });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving agent data", message: error.message });
    }
});

app.get('/coinbase/account/:schema', async (req, res) => {
    try {
        const agent = await retrieveFromNillion(req.params.schema);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        const coinbaseData = {
            balance: "5.23 BTC",
            transactions: [
                { id: "txn_001", type: "deposit", amount: "2.5 BTC" },
                { id: "txn_002", type: "withdrawal", amount: "1.0 BTC" }
            ]
        };
        res.json({ success: true, coinbaseData });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve Coinbase data", message: error.message });
    }
});

app.post('/coinbase/transaction/:schema', async (req, res) => {
    try {
        const { to, amount, currency } = req.body;
        const agent = await retrieveFromNillion(req.params.schema);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        if (!to || !amount || !currency) {
            return res.status(400).json({ error: "Invalid request format" });
        }
        const transactionData = {
            success: true,
            transactionId: uuidv4(),
            status: "Completed",
            to,
            amount,
            currency
        };
        res.json(transactionData);
    } catch (error) {
        res.status(500).json({ error: "Failed to execute transaction", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
