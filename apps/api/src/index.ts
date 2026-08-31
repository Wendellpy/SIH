import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';
import { cadastreRouter } from './controllers/cadastre.controller.js';
import { jobsRouter } from './controllers/jobs.controller.js';
import { adminRouter } from './controllers/admin.controller.js';
import { maharashtraRouter } from './controllers/maharashtra.controller.js';
import { reraRouter } from './controllers/rera.controller.js';
import { blockchainRouter } from './controllers/blockchain.controller.js';
import { landEventRouter } from './controllers/land-event.controller.js';
import { jobsService } from './services/jobs.service.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors({ origin: '*' }));
app.use(express.json());

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '3D ULPIN Cadastral Backend API',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/v1', cadastreRouter);
app.use('/api/v1', jobsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/maharashtra', maharashtraRouter);
app.use('/api/v1', reraRouter);
app.use('/api/v1', blockchainRouter);
app.use('/api/v1', landEventRouter);

// WebSocket Real-time Job Progress Streaming
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Subscribed to 3D Cadastral Realtime Bus' }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Broadcast job updates
jobsService.subscribe((job) => {
  const payload = JSON.stringify({ type: 'JOB_UPDATE', job });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 3D ULPIN Cadastral API running at http://localhost:${PORT}`);
  console.log(`📑 OpenAPI / Swagger Docs at http://localhost:${PORT}/api/docs`);
  console.log(`⚡ WebSocket Server listening on ws://localhost:${PORT}/ws`);
});
