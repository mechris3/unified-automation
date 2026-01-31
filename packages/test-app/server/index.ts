import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// File Upload Configuration
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * Configures Multer for disk storage.
 * Files are saved to the 'uploads' directory with a timestamp-prefixed filename.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes

/**
 * POST /api/upload
 * Endpoint to handle file uploads.
 * Simulates a delay before responding to test async handling.
 * 
 * @param {file} - Form data field named 'file' containing the upload.
 * @returns {JSON} - Returns the filename and size upon success.
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Simulate processing delay of 1 second
  setTimeout(() => {
    res.json({
      message: 'File uploaded successfully',
      filename: req.file?.filename,
      size: req.file?.size
    });
  }, 1000);
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'running', uptime: process.uptime() });
});

// Start Server
app.listen(PORT, () => {
});
