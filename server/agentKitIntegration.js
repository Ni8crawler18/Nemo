import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for agent data
const agentDataStore = [];

/**
 * @route   POST /store-agent-data
 * @desc    Stores agent data with a valid UUID schema
 */
app.post('/store-agent-data', (req, res) => {
    try {
        const { agent_name, api_key, task_log, schema } = req.body;

        // Validate required fields
        if (!agent_name || !api_key || !task_log || !Array.isArray(task_log)) {
            return res.status(400).json({ error: "Invalid request format", message: "Ensure all required fields are provided" });
        }

        // Validate or generate UUID for schema
        const validSchema = schema && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(schema) 
            ? schema 
            : uuidv4();

        // Store agent data
        const newAgentData = {
            id: uuidv4(),
            agent_name,
            api_key,
            schema: validSchema,
            task_log
        };

        agentDataStore.push(newAgentData);

        res.json({ success: true, message: "Agent data stored successfully", data: newAgentData });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

/**
 * @route   GET /get-agent-data
 * @desc    Retrieves stored agent data
 */
app.get('/get-agent-data', (req, res) => {
    try {
        if (!agentDataStore.length) {
            return res.status(404).json({ error: "No data found", message: "No agent data available" });
        }

        res.json({ success: true, agentData: agentDataStore });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving agent data", message: error.message });
    }
});

/**
 * @route   GET /get-agent-data/:id
 * @desc    Retrieves specific agent data by ID
 */
app.get('/get-agent-data/:id', (req, res) => {
    try {
        const agent = agentDataStore.find(a => a.id === req.params.id);
        
        if (!agent) {
            return res.status(404).json({ error: "Agent not found", message: "No agent data available for given ID" });
        }

        res.json({ success: true, agentData: agent });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving agent data", message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
