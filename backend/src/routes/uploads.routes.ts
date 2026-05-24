// src/routes/uploads.routes.ts
import express from 'express';
import path from 'path';

const router = express.Router();

// Only allow simple image filenames (no slashes, no "..", image extensions).
// Prevents path traversal via the :filename param.
const SAFE_IMAGE_NAME = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

const uploadsRoot = path.join(__dirname, '../../uploads/students');

// Serve student profile pictures
// NOTE: served without per-request auth so <img src> tags work. Filenames embed
// a UUID studentId so they are not enumerable. For stronger access control,
// migrate to signed URLs or cookie-authenticated streaming.
router.get('/students/:filename', (req, res) => {
    const filename = req.params.filename;

    if (!SAFE_IMAGE_NAME.test(filename) || filename.includes('..')) {
        return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    const filePath = path.join(uploadsRoot, filename);

    // Defense in depth: resolved path must stay inside the uploads directory.
    if (path.dirname(filePath) !== uploadsRoot) {
        return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
    });
});

export default router;
