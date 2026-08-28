"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: '3D ULPIN Generation & Vertical Property Mapping System API',
        version: '1.0.0',
        description: 'Ministry of Rural Development (DoLR) - Smart India Hackathon #26011. Backend API for 3D Cadastral Registry, 3D ULPIN Generation, Async AI Job Pipelines, Subterranean Utilities, and Spatial Topology Validation.'
    },
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Local Development Server'
        }
    ],
    paths: {
        '/api/v1/parcels': {
            get: {
                summary: 'List all surface cadastral parcels',
                responses: {
                    '200': { description: 'Successful response' }
                }
            }
        },
        '/api/v1/parcels/{ulpin}': {
            get: {
                summary: 'Get parcel by 14-char base ULPIN with linked 3D vertical units and underground utilities',
                parameters: [
                    { name: 'ulpin', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Parcel hierarchy resolved' },
                    '404': { description: 'Parcel not found' }
                }
            }
        },
        '/api/v1/ulpin/{id3d}': {
            get: {
                summary: 'Resolve full 3D ULPIN (e.g. MH13BOM04521873.A+03-B302)',
                parameters: [
                    { name: 'id3d', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: '3D unit, building, parcel, and geometry stats' },
                    '404': { description: '3D ULPIN not found' }
                }
            }
        },
        '/api/v1/underground': {
            get: {
                summary: 'Retrieve 3D underground infrastructure assets (water, sewer, electric, telecom, gas, metro)',
                responses: {
                    '200': { description: 'List of underground 3D linestrings with depth range' }
                }
            }
        },
        '/api/v1/search': {
            get: {
                summary: 'Universal search across 3D ULPINs, owners, addresses, and utilities',
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Matching cadastral entities' }
                }
            }
        },
        '/api/v1/floorplans/upload': {
            post: {
                summary: 'Upload architectural floor plan to vectorize & generate 3D vertical units',
                responses: {
                    '202': { description: 'Async AI processing job enqueued' }
                }
            }
        },
        '/api/v1/pointcloud/upload': {
            post: {
                summary: 'Upload LiDAR / point cloud tile for nDSM building height extraction',
                responses: {
                    '202': { description: 'Async LiDAR job enqueued' }
                }
            }
        },
        '/api/v1/admin/conflicts': {
            get: {
                summary: 'List detected 3D solid topology conflicts and warnings',
                responses: {
                    '200': { description: 'List of topology validation records' }
                }
            }
        },
        '/api/v1/admin/audit-logs': {
            get: {
                summary: 'Retrieve immutable cryptographic audit ledger of all mutations',
                responses: {
                    '200': { description: 'Audit log entries with SHA-256 signatures' }
                }
            }
        }
    }
};
