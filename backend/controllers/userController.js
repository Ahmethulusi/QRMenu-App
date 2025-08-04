const User = require('../models/User');
const { Business } = require('../models');
const bcrypt = require('bcrypt');

// Tüm kullanıcıları getir
exports.getAllUsers = async (req, res) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
      return res.status(400).json({ error: 'business_id gerekli' });
    }

    const users = await User.findAll({
      where: { business_id },
      include: [
        {
          model: Business,
          as: 'Business',
          attributes: ['name'],
        }
      ],
      order: [['user_id', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
};

// Yeni kullanıcı oluştur
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, business_id } = req.body;

    if (!name || !email || !password || !role || !business_id) {
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
      role,
      business_id,
    });

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
      }
    });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({ error: 'Kullanıcı oluşturulamadı' });
  }
};

// Kullanıcı güncelle
exports.updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Email kontrolü (kendi email'i hariç)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
    });

    res.json({
      message: 'Kullanıcı başarıyla güncellendi',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
      }
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
  }
};

// Kullanıcı sil
exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    await user.destroy();
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
};

// Kullanıcı şifresini güncelle
exports.updatePassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Yeni şifre gerekli' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({ error: 'Şifre güncellenemedi' });
  }
}; 