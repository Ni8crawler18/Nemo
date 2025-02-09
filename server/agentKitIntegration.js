import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Nillion Nodes (Example)
const NILLION_NODES = [
    "https://nildb-zy8u.nillion.network",
    "https://nildb-rl5g.nillion.network",
    "https://nildb-lpjp.nillion.network"
];

// Function to store agent data on Nillion
async function storeOnNillion(data) {
    try {
        const node = NILLION_NODES[Math.floor(Math.random() * NILLION_NODES.length)];
        const response = await axios.post(`${node}/store`, data);
        return response.data;
    } catch (error) {
        console.error("Nillion Storage Error:", error.response?.data || error.message);
        throw new Error("Failed to store data on Nillion");
    }
}

// Function to retrieve agent data from Nillion
async function retrieveFromNillion(schema) {
    try {
        const node = NILLION_NODES[Math.floor(Math.random() * NILLION_NODES.length)];
        const response = await axios.get(`${node}/retrieve?schema=${schema}`);
        return response.data;
    } catch (error) {
        console.error("Nillion Retrieval Error:", error.response?.data || error.message);
        throw new Error("Failed to retrieve data from Nillion");
    }
}

/**
 * @route   POST /store-agent-data
 * @desc    Stores agent data on Nillion
 */
app.post('/store-agent-data', async (req, res) => {
    try {
        const { _id, agent_name, api_key, task_log } = req.body;

        if (!_id || !agent_name || !api_key || !Array.isArray(task_log) || task_log.length < 1) {
            return res.status(400).json({ error: "Invalid request format", message: "Ensure all required fields are provided" });
        }

        const schema = uuidv4(); // Generate a schema UUID for organization

        const agentData = { _id, agent_name, api_key, schema, task_log };

        // Store data on Nillion
        await storeOnNillion(agentData);

        res.json({ success: true, message: "Agent data stored successfully on Nillion", schema });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

/**
 * @route   GET /get-agent-data/:schema
 * @desc    Retrieves stored agent data from Nillion
 */
app.get('/get-agent-data/:schema', async (req, res) => {
    try {
        const agentData = await retrieveFromNillion(req.params.schema);
        if (!agentData) {
            return res.status(404).json({ error: "No data found", message: "No agent data available" });
        }
        res.json({ success: true, agentData });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving agent data", message: error.message });
    }
});

/**
 * @route   GET /coinbase/account/:schema
 * @desc    Retrieves Coinbase account details using API key stored in Nillion
 */
app.get('/coinbase/account/:schema', async (req, res) => {
    try {
        const agent = await retrieveFromNillion(req.params.schema);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found", message: "No agent data available for given schema" });
        }

        const response = await axios.get("https://api.coinbase.com/v2/accounts", {
            headers: { Authorization: `Bearer ${agent.api_key}` }
        });

        res.json({ success: true, coinbaseData: response.data });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve Coinbase data", message: error.response?.data || error.message });
    }
});

/**
 * @route   POST /coinbase/transaction/:schema
 * @desc    Executes a Coinbase transaction using stored API key
 */
app.post('/coinbase/transaction/:schema', async (req, res) => {
    try {
        const { to, amount, currency } = req.body;
        const agent = await retrieveFromNillion(req.params.schema);

        if (!agent) {
            return res.status(404).json({ error: "Agent not found", message: "No agent data available for given schema" });
        }

        if (!to || !amount || !currency) {
            return res.status(400).json({ error: "Invalid request format", message: "Missing transaction details" });
        }

        const response = await axios.post("https://api.coinbase.com/v2/accounts/primary/transactions", {
            type: "send",
            to,
            amount,
            currency
        }, {
            headers: { Authorization: `Bearer ${agent.api_key}` }
        });

        res.json({ success: true, transactionData: response.data });
    } catch (error) {
        res.status(500).json({ error: "Failed to execute transaction", message: error.response?.data || error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
