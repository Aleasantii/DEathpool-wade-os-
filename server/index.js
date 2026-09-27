import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { deadpoolPersona } from './engine/deadpoolPersona.js';
import { selfModEngine } from './engine/selfModificationEngine.js';
import { wadeBrain } from './engine/wadeBrain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize self modification engine
await selfModEngine.init();

// API Endpoints

// 1. Health & Deadpool Diagnostics
app.get('/api/status', (req, res) => {
  res.json({
    diagnostics: deadpoolPersona.getSystemDiagnostics(),
    greeting: deadpoolPersona.getGreeting(),
    activePlugins: selfModEngine.getLoadedPlugins()
  });
});

// 2. Chat / Brain execution endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Hey! Feed me a message, don't leave me hanging!" });
    }

    const brainResponse = await wadeBrain.processRequest(message);
    res.json({
      success: true,
      data: brainResponse,
      diagnostics: deadpoolPersona.getSystemDiagnostics()
    });
  } catch (error) {
    console.error("[SERVER ERROR]", error);
    res.status(500).json({
      error: "Healing Factor encountered a glitch!",
      details: error.message
    });
  }
});

// 3. Dynamic Self-Code Modification Endpoint
app.post('/api/self-modify', async (req, res) => {
  try {
    const { toolName, description, javascriptCode } = req.body;

    if (!toolName || !javascriptCode) {
      return res.status(400).json({ error: "Missing toolName or javascriptCode for self-modification!" });
    }

    const result = await selfModEngine.generateAndInstallTool(
      toolName,
      description || "Manually triggered self-code extension",
      javascriptCode
    );

    res.json({
      success: true,
      result,
      activePlugins: selfModEngine.getLoadedPlugins()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get Dynamic Plugins and Evolution History
app.get('/api/evolution', (req, res) => {
  res.json({
    plugins: selfModEngine.getLoadedPlugins(),
    history: selfModEngine.getEvolutionHistory()
  });
});

// Serve frontend in production or fallback
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🔴 WADE OS (Deadpool JARVIS AI Engine) active on port ${PORT}`);
  console.log(`⚔️  Maximum Effort! Healing factor fully operational.`);
  console.log(`==================================================\n`);
});
