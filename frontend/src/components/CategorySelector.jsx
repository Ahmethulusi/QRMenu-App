import React, { useState, useRef, useEffect } from 'react';
import { Select, Divider, Input, Space, Button, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const { Option } = Select;

const CategorySelect = ({ selectedCategoryId, onCategoryChange = () => {}, value, onChange }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  const [Categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kategorileri yükle
  const fetchCategories = async () => {
    try {
      console.log('🔄 Kategoriler yükleniyor... (yeni endpoint: /categories/list)');
      console.log('📝 Props:', { selectedCategoryId, onCategoryChange: !!onCategoryChange });
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı');
        setCategories([]);
        return;
      }
      console.log('✅ Token bulundu, API çağrısı yapılıyor...');

      const response = await fetch(`${API_URL}/api/admin/categories/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error(`❌ API Hatası: ${response.status} - ${response.statusText}`);
        if (response.status === 401) {
          console.error('❌ Oturum süresi dolmuş');
          setCategories([]);
          return;
        } else if (response.status === 403) {
          console.error('❌ Bu işlem için yetkiniz bulunmuyor');
          setCategories([]);
          return;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      console.log('✅ API yanıtı başarılı');

      const data = await response.json();
      console.log('📦 API yanıtı:', data);
      
      // Veri kontrolü
      if (!data || !Array.isArray(data)) {
        console.error('❌ API geçersiz veri döndürdü:', data);
        setCategories([]);
        return;
      }

      console.log(`✅ ${data.length} kategori başarıyla yüklendi`);
      setCategories(data);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
      setCategories([]);
    } finally {
      setLoading(false);
      console.log('🏁 Kategori yükleme işlemi tamamlandı');
    }
  };

  // categories prop'u değiştiğinde local state'i güncelle
  useEffect(() => {
    console.log('🔄 CategorySelector useEffect çalıştı');
    fetchCategories();
  }, []);

  // selectedCategoryId değiştiğinde form state'ini güncelle
  useEffect(() => {
    if (selectedCategoryId) {
      console.log('🔄 selectedCategoryId değişti:', selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const addCategory = async () => {
    if (!name.trim()) {
      message.error('Kategori adı boş olamaz!');
      return;
    }

    if (Categories.find(cat => cat.category_name === name.trim())) {
      message.error('Bu kategori zaten mevcut!');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/categories/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category_name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Kategori oluşturulamadı');
      }

      const newCategory = await response.json();
      
      // Yeni kategoriyi listeye ekle
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Form'da yeni kategoriyi seç
      const form = document.querySelector('form');
      if (form) {
        const categoryField = form.querySelector('input[name="category"]');
        if (categoryField) {
          categoryField.value = newCategory.category_id;
        }
      }
      
      message.success('Kategori başarıyla oluşturuldu!');
      setName('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      message.error('Kategori oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  console.log('🎨 CategorySelector render:', { 
    loading, 
    categoriesCount: Categories?.length || 0, 
    selectedCategoryId,
    value,
    hasOnChange: !!onCategoryChange,
    hasFormOnChange: !!onChange,
    categories: Categories?.slice(0, 3) // İlk 3 kategoriyi göster
  });

  return (
    <Select
      placeholder={loading ? "Yükleniyor..." : "Kategori seçin"}
      loading={loading}
      disabled={loading}
      value={value !== undefined ? value : (selectedCategoryId || undefined)}
      onChange={(selectedValue) => {
        console.log('🎯 Kategori seçildi:', selectedValue);
        console.log('🎯 onCategoryChange fonksiyonu çağrılıyor:', !!onCategoryChange);
        console.log('🎯 onCategoryChange fonksiyonu:', onCategoryChange);
        console.log('🎯 Form onChange çağrılıyor:', !!onChange);
        
        // Form.Item için onChange
        if (onChange) {
          onChange(selectedValue);
        }
        
        // Custom callback için onCategoryChange
        if (onCategoryChange) {
          onCategoryChange(selectedValue);
        }
      }}
      dropdownRender={menu => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              placeholder="Yeni kategori ekleyin"
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              onClick={addCategory}
              loading={loading}
              disabled={!name.trim()}
            >
              Ekle
            </Button>
          </Space>
        </>
      )}
    >
      {Categories && Array.isArray(Categories) && Categories.length > 0 ? (
        Categories.map((category) => {
          console.log('📝 Kategori option:', category);
          return (
            <Option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </Option>
          );
        })
      ) : (
        <Option value="" disabled>
          {Categories === null ? 'Yükleniyor...' : 'Kategori bulunamadı'}
        </Option>
      )}
    </Select>
  );
};

export default CategorySelect;
