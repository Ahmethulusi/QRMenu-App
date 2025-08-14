

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Kullanıcı kayıt
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, business_id } = req.body;

    if (!name || !email || !password || !business_id) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'manager',
      business_id,
    });

    // JWT token oluştur
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role,
        business_id: user.business_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Kullanıcı kaydedilemedi' });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Şifreyi kontrol et
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Geçersiz şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role,
        business_id: user.business_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
};

// Token doğrulama middleware'i
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Rol kontrolü middleware'i
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Kullanıcı bilgisi bulunamadı' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Veritabanından kullanıcı bilgilerini al
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      business_id: user.business_id,
    });

  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
  }
};

exports.logout = async (req, res) => {
  try {
    // JWT token'ı blacklist'e eklenebilir (şimdilik basit)
    res.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    console.error('Logout hatası:', error);
    res.status(500).json({ error: 'Çıkış yapılamadı' });
  }
};






