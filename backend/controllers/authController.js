

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
        branch_id: user.branch_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userInfo = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      business_id: user.business_id,
      branch_id: user.branch_id
    };

    res.json({
      message: 'Giriş başarılı',
      token,
      user: userInfo
    });

  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      business_id: user.business_id,
      branch_id: user.branch_id
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






