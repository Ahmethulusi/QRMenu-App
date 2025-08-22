const { Language } = require('./models');
const db = require('./db');

const defaultLanguages = [
  {
    code: 'tr',
    name: 'Turkish',
    native_name: 'Türkçe',
    is_default: true,
    is_active: true,
    direction: 'ltr'
  },
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    is_default: false,
    is_active: true,
    direction: 'ltr'
  },
  {
    code: 'de',
    name: 'German',
    native_name: 'Deutsch',
    is_default: false,
    is_active: true,
    direction: 'ltr'
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    is_default: false,
    is_active: true,
    direction: 'ltr'
  },
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    is_default: false,
    is_active: true,
    direction: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    native_name: 'العربية',
    is_default: false,
    is_active: true,
    direction: 'rtl'
  }
];

async function seedLanguages() {
  try {
    await db.authenticate();
    console.log('✅ Veritabanına bağlanıldı.');

    // Mevcut dilleri kontrol et
    const existingLanguages = await Language.findAll();
    
    if (existingLanguages.length === 0) {
      console.log('🌱 Diller ekleniyor...');
      
      for (const lang of defaultLanguages) {
        await Language.create(lang);
        console.log(`✅ ${lang.native_name} (${lang.code}) eklendi`);
      }
      
      console.log('🎉 Tüm diller başarıyla eklendi!');
    } else {
      console.log('ℹ️ Diller zaten mevcut, ekleme yapılmadı.');
      console.log('Mevcut diller:', existingLanguages.map(l => `${l.native_name} (${l.code})`).join(', '));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

seedLanguages();
