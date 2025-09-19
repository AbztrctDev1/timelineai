import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
// Railway provides the PORT, but we'll fallback to 3001 for local testing
const PORT = process.env.PORT || 3001;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is the crucial part: serve the static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// This "catch-all" route is essential for single-page apps (like React Router)
// It sends the index.html for any request that doesn't match a static file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on 0.0.0.0 to be accessible in containerized environments like Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});