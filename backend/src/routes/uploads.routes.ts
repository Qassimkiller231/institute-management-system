// src/routes/uploads.routes.ts
import express from 'express';
import path from 'path';

const router = express.Router();

// Serve student profile pictures
router.get('/students/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/students/', filename);

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
