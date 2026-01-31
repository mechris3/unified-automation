import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { discoverJourneys } from './journey-discovery';
import { TestExecutor } from './test-executor';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let currentExecutor: TestExecutor | null = null;

app.use(express.json());
// Serve the frontend
app.use(express.static(path.join(__dirname, '../public')));

// Serve Playwright report if it exists
const playwrightReportPath = path.join(__dirname, '../../../packages/playwright-runner/playwright-report');
app.use('/playwright-report', express.static(playwrightReportPath));

app.get('/api/journeys', async (req, res) => {
  try {
    const journeys = await discoverJourneys();
    res.json(journeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover journeys' });
  }
});

app.post('/api/tests/run', (req, res) => {
  const { journeys, tool, mode, config } = req.body;
  
  if (currentExecutor) {
    return res.status(400).json({ error: 'Tests already running' });
  }
  
  currentExecutor = new TestExecutor(tool, mode, wss, config);
  
  // Note: We don't await run() here so the request returns immediately
  currentExecutor.run(journeys).finally(() => {
    currentExecutor = null;
  });
  
  res.json({ status: 'started' });
});

app.post('/api/tests/stop', (req, res) => {
  if (currentExecutor) {
    currentExecutor.stop();
    currentExecutor = null;
    res.json({ status: 'stopped' });
  } else {
    res.json({ status: 'no tests running' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
});
