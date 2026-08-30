"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyCardService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
class PropertyCardService {
    /**
     * Generates a deterministic hash for a given record to ensure tamper evidence.
     * We sort keys before stringifying to guarantee canonical JSON format.
     */
    static generateRecordHash(record) {
        const canonicalObject = this.sortKeys(record);
        const jsonString = JSON.stringify(canonicalObject);
        return crypto_1.default.createHash('sha256').update(jsonString).digest('hex');
    }
    static sortKeys(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(this.sortKeys.bind(this));
        }
        return Object.keys(obj).sort().reduce((result, key) => {
            result[key] = this.sortKeys(obj[key]);
            return result;
        }, {});
    }
    /**
     * Generates the 3D Property Card PDF.
     * Returns a Promise that resolves with a Buffer containing the PDF data.
     */
    static async generateCard(entity, type, thumbnailBase64) {
        return new Promise(async (resolve, reject) => {
            try {
                const recordHash = this.generateRecordHash(entity);
                // Define app URL (fallback to localhost if not set)
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                // The unique ULPIN depends on entity type
                let ulpin = '';
                if (type === 'VerticalUnit')
                    ulpin = entity.ulpin3D;
                else if (type === 'UndergroundAsset')
                    ulpin = entity.ulpin3D;
                else if (type === 'Building')
                    ulpin = entity.ulpin3D || '';
                else
                    ulpin = entity.ulpin;
                const liveUrl = `${appUrl}/unit/${ulpin}`;
                // Generate QR Code as data URI
                const qrCodeDataUrl = await qrcode_1.default.toDataURL(liveUrl, { margin: 1, width: 120 });
                // Create PDF Document
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    resolve({ pdfBuffer: Buffer.concat(buffers), recordHash });
                });
                // -------------------------
                // Render PDF Content
                // -------------------------
                // Header
                doc.fontSize(24).font('Helvetica-Bold').fillColor('#0ea5e9').text('3D Cadastral Property Card', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica').fillColor('#333333').text(`Unique Land Parcel Identification Number (ULPIN)`, { align: 'center' });
                doc.fontSize(18).font('Helvetica-Bold').fillColor('#10b981').text(ulpin, { align: 'center' });
                doc.moveDown(2);
                // Body: Attributes
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Property Details:');
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica');
                if (type === 'VerticalUnit') {
                    const unit = entity;
                    doc.text(`Unit Code: ${unit.unitCode}`);
                    doc.text(`Level Code: ${unit.levelCode}`);
                    doc.text(`Floor Number: ${unit.floorNumber}`);
                    doc.text(`Carpet Area: ${unit.carpetAreaSqm} sq.m`);
                    doc.text(`Volume: ${unit.volumeCum} cu.m`);
                    doc.text(`Usage: ${unit.useType}`);
                    doc.text(`Owner: ${unit.ownerName}`);
                }
                else if (type === 'Parcel') {
                    const parcel = entity;
                    doc.text(`Survey Number: ${parcel.surveyNumber}`);
                    doc.text(`Village/Locality: ${parcel.village}`);
                    doc.text(`Land Area: ${parcel.areaSqm} sq.m`);
                    doc.text(`Zoning: ${parcel.zoningCategory}`);
                    doc.text(`Owner: ${parcel.ownershipType}`);
                }
                else if (type === 'Building') {
                    const bldg = entity;
                    doc.text(`Building Name: ${bldg.name}`);
                    doc.text(`Address: ${bldg.address}`);
                    doc.text(`Estimated Height: ${bldg.roofHeightM}m`);
                    doc.text(`Number of Floors: ${bldg.numFloors}`);
                }
                else if (type === 'UndergroundAsset') {
                    const asset = entity;
                    doc.text(`Asset Type: ${asset.assetType}`);
                    doc.text(`Owning Agency: ${asset.owningAgency}`);
                    doc.text(`Depth Range: ${asset.depthMinM}m to ${asset.depthMaxM}m`);
                    doc.text(`Risk Level: ${asset.riskLevel}`);
                }
                doc.moveDown(2);
                // 3D View Screenshot
                if (thumbnailBase64 && thumbnailBase64.startsWith('data:image/')) {
                    try {
                        doc.fontSize(14).font('Helvetica-Bold').text('3D Scene Capture:');
                        doc.moveDown(0.5);
                        // The canvas toDataUrl provides a base64 string with a data URI prefix.
                        // PDFKit requires just the base64 data or a buffer.
                        const base64Data = thumbnailBase64.split(';base64,').pop();
                        if (base64Data) {
                            const imgBuffer = Buffer.from(base64Data, 'base64');
                            doc.image(imgBuffer, { width: 400, align: 'center' });
                        }
                    }
                    catch (imgErr) {
                        console.error('Error embedding thumbnail into PDF:', imgErr);
                        doc.fontSize(10).fillColor('red').text('(Screenshot capture unavailable)');
                    }
                }
                // QR Code & Footer positioning
                const yPos = doc.page.height - 150;
                doc.image(qrCodeDataUrl, 50, yPos, { width: 100 });
                doc.fontSize(10).font('Helvetica').fillColor('#666666');
                doc.text('Scan to view live interactive 3D model.', 160, yPos + 10);
                doc.text(`Generated at: ${new Date().toISOString()}`, 160, yPos + 40);
                // Digital Signature Hash Footer
                doc.fontSize(8).font('Courier').fillColor('#999999');
                doc.text(`Cryptographic Record Hash (SHA-256):`, 50, yPos + 100);
                doc.font('Courier-Bold').fillColor('#10b981').text(recordHash, 50, yPos + 115);
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static async generateCertificate(conflicts, footprint) {
        return new Promise(async (resolve, reject) => {
            try {
                const certificateData = { conflicts, footprint, type: 'UtilityClearanceCertificate', timestamp: new Date().toISOString() };
                const recordHash = this.generateRecordHash(certificateData);
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    resolve({ pdfBuffer: Buffer.concat(buffers), recordHash });
                });
                // Header
                doc.fontSize(24).font('Helvetica-Bold').fillColor('#ef4444').text('Utility Clearance Certificate', { align: 'center' });
                doc.moveDown(2);
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Certificate Details:');
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica');
                doc.text(`Total Conflicts Found: ${conflicts.length}`);
                doc.moveDown(1);
                doc.fontSize(14).font('Helvetica-Bold').text('Conflict Analysis:');
                doc.moveDown(0.5);
                if (conflicts.length === 0) {
                    doc.fontSize(12).font('Helvetica').fillColor('#10b981').text('No conflicts detected. The footprint is clear for construction.');
                }
                else {
                    doc.fontSize(12).font('Helvetica');
                    conflicts.forEach((conflict, idx) => {
                        doc.fillColor(conflict.severity === 'high' ? '#ef4444' : (conflict.severity === 'medium' ? '#f59e0b' : '#3b82f6'));
                        doc.text(`${idx + 1}. [${conflict.severity.toUpperCase()}] ${conflict.type} (ID: ${conflict.utility_id})`);
                        doc.fillColor('#333333');
                        doc.text(`   Distance: ${conflict.distance.toFixed(2)}m`);
                    });
                }
                const yPos = doc.page.height - 150;
                doc.fontSize(10).font('Helvetica').fillColor('#666666');
                doc.text(`Generated at: ${new Date().toISOString()}`, 50, yPos + 40);
                // Digital Signature Hash Footer
                doc.fontSize(8).font('Courier').fillColor('#999999');
                doc.text(`Cryptographic Record Hash (SHA-256):`, 50, yPos + 100);
                doc.font('Courier-Bold').fillColor('#10b981').text(recordHash, 50, yPos + 115);
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.PropertyCardService = PropertyCardService;
