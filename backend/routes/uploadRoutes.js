const express = require('express');
const router = express.Router();
const { upload, isCloudinaryConfigured } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let imageUrl = '';
    if (isCloudinaryConfigured) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
      // Local file path. We will serve /uploads statically, so URL will be /uploads/filename
      imageUrl = `/uploads/${req.file.filename}`;
    }

    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
