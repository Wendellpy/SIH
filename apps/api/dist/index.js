"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_js_1 = require("./swagger.js");
const cadastre_controller_js_1 = require("./controllers/cadastre.controller.js");
const jobs_controller_js_1 = require("./controllers/jobs.controller.js");
const admin_controller_js_1 = require("./controllers/admin.controller.js");
const maharashtra_controller_js_1 = require("./controllers/maharashtra.controller.js");
const rera_controller_js_1 = require("./controllers/rera.controller.js");
const jobs_service_js_1 = require("./services/jobs.service.js");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// API Documentation
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_js_1.swaggerDocument));
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
app.use('/api/v1', cadastre_controller_js_1.cadastreRouter);
app.use('/api/v1', jobs_controller_js_1.jobsRouter);
app.use('/api/v1/admin', admin_controller_js_1.adminRouter);
app.use('/api/v1/maharashtra', maharashtra_controller_js_1.maharashtraRouter);
app.use('/api/v1', rera_controller_js_1.reraRouter);
// WebSocket Real-time Job Progress Streaming
const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Subscribed to 3D Cadastral Realtime Bus' }));
    ws.on('close', () => {
        clients.delete(ws);
    });
});
// Broadcast job updates
jobs_service_js_1.jobsService.subscribe((job) => {
    const payload = JSON.stringify({ type: 'JOB_UPDATE', job });
    clients.forEach((ws) => {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
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
