const express = require('express');
const router = express.Router();
const { uploadSingle, uploadSingleToCloudflare } = require('../middleware/uploadMiddleware');
const { CloudflareService } = require('../middleware/cloudflareMiddleware');
const path = require('path');
const fs = require('fs');

// Cloudflare servisini başlat
const cloudflareService = new CloudflareService();

// Cloudflare test route - hem local hem de Cloudflare'e yükler
router.post('/cloudflare-test', uploadSingleToCloudflare('product', 'file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Dosya yüklenemedi' });
    }

    // Dosya başarıyla yüklendi
    console.log('Cloudflare Upload Başarılı:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      localPath: req.file.path,
      cloudUrl: req.file.cloudUrl,
      cloudPath: req.file.cloudPath
    });

    res.json({
      success: true,
      message: 'Dosya başarıyla Cloudflare\'e yüklendi',
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: req.file.cloudUrl,
        cloudPath: req.file.cloudPath
      }
    });
  } catch (error) {
    console.error('Cloudflare upload hatası:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Basit test route - sadece local upload yapar
router.post('/test', uploadSingle('product', 'file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Dosya yüklenemedi' });
    }

    // Dosya başarıyla yüklendi
    const fileUrl = `/public/images/${path.basename(req.file.path)}`;
    
    console.log('Test Upload Başarılı:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      publicUrl: fileUrl
    });

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload hatası:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Basit dosya listeleme route'u
router.get('/list', (req, res) => {
  const imagesDir = path.join(process.cwd(), 'public/images');
  
  try {
    if (!fs.existsSync(imagesDir)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(imagesDir)
      .filter(file => {
        const stat = fs.statSync(path.join(imagesDir, file));
        return stat.isFile();
      })
      .map(file => ({
        name: file,
        url: `/public/images/${file}`,
        size: fs.statSync(path.join(imagesDir, file)).size
      }));
    
    res.json({ files });
  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dosya silme route'u
router.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'public/images', filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Dosya başarıyla silindi' });
    } else {
      res.status(404).json({ success: false, message: 'Dosya bulunamadı' });
    }
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;