import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message ,InputNumber, Col,Row,Select,Radio, AutoComplete} from 'antd';
import { PlusOutlined,UploadOutlined } from '@ant-design/icons';
import CategorySelector from './CategorySelector'
// import '../css/CategoryFormModal.css';
const API_URL = import.meta.env.VITE_API_URL;
const ModalForm = ({ visible, onCancel, onOk}) => {
  const [form] = Form.useForm(); // Form kontrolü
  // const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const [status, setStatus] = useState('true');
  const [showcase, setShowcase] = useState('false');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // Ürünleri çek
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/products`);
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setProducts(data.map(product => product.product_name));
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      message.error('Ürünler yüklenirken bir hata oluştu');
    }
  };

  // İsim değiştiğinde kontrol et
  const handleNameChange = (value) => {
    setSearchValue(value);
    const exists = products.some(product => 
      product.toLowerCase() === value.toLowerCase()
    );
    
    if (exists) {
      form.setFields([
        {
          name: 'name',
          errors: ['Bu isimde bir ürün zaten mevcut!']
        }
      ]);
    }
  };

  // Resim silme fonksiyonu
  const handleRemove = () => {
    setFile(null); // Yüklenen dosyayı sıfırlıyoruz
  };

  const onCancel_handler = () => {
    form.resetFields();
    setFile(null);
    onCancel();
  };



  // Resim yükleme değişikliği olduğunda çalışır
  const handleUpload = ({ file }) => setFile(file);

  // Form submit edildiğinde çağrılan fonksiyon
  const handleOk = async () => {
    try {
      setLoading(true);
      
      // Form verilerini al
      const values = await form.validateFields();
  
      const formData = new FormData();
      formData.append('resim', file);
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('category_id', values.category);
      formData.append('price', values.price);
      formData.append('status', status === 'true');
      formData.append('showcase', showcase === 'true');
      
      // Backend'e veri gönderme
      const response = await fetch(`${API_URL}/api/admin/products/create`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ürün oluşturulurken bir hata oluştu');
      }
  
      message.success('Ürün başarıyla oluşturuldu!');
      form.resetFields();  // Formu sıfırla
      setFile(null);
      onOk();
    } catch (error) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <Modal
    title="Ürün Oluştur"
    visible={visible}
    onOk={handleOk}
    onCancel={onCancel_handler}
    okText="Oluştur"
    cancelText="İptal"
    padding={0}
    width={600}
    style={{ height: 400,top: 25 }}
  >
    {/* Form Bileşeni */}
    <Form form={form} layout="vertical">
      {/* İsim */}
      <Form.Item
        label="İsim"
        name="name"
        rules={[
          { required: true, message: 'Lütfen ürün adını giriniz!' },
          () => ({
            validator(_, value) {
              if (!value || !products.some(product => product.toLowerCase() === value.toLowerCase())) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Bu isimde bir ürün zaten mevcut!'));
            },
          }),
        ]}
      >
        <AutoComplete
          placeholder="Ürün adını girin"
          onChange={handleNameChange}
          value={searchValue}
          options={searchValue ? products
            .filter(product => 
              product.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map(product => ({ value: product }))
            : []
          }
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }
        />
      </Form.Item>

      {/* Grid Sistemi: Açıklama ve Kategori */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Açıklama"
            name="description"
            // rules={[{ required: true, message: 'Lütfen açıklama giriniz!' }]}
          >
            <Input placeholder="Açıklama girin" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <CategorySelector/>
        </Col>
      </Row>

      {/* Grid Sistemi: Fiyat ve Resim Yükleme */}
    <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            label="Fiyat"
            name="price"
            rules={[{ required: true, message: 'Lütfen fiyat giriniz!' }]}
          >
            <InputNumber placeholder="Fiyat girin" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
       
        <Col span={12}>
          <Form.Item
            label="Stok"
            name="stock"
          
          >
            <InputNumber placeholder="Stok girin" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
    </Row>
    <Row gutter={20}>
        <Col span={12}>
            <Form.Item label="Resim Yükle" name="upload" style={{ marginLeft:'5%'}}>
                {file ? <>
                <img src={URL.createObjectURL(file)} style={{ width:'120px',height:'120px' }} />
                <Button type="primary" onClick={handleRemove} style={{ marginLeft:'5%' ,marginTop:'5%'}}>Resimi Kaldır</Button>
                </> : <>
                <Upload
                    accept="image/*"
                    beforeUpload={() => false}  // Dosyanın otomatik yüklenmesini durduruyoruz
                    onChange={info => handleUpload(info)}  // Dosyayı manuel olarak yüklüyoruz
                    showUploadList={false}
                    >
                    {file ? <img src={URL.createObjectURL(file)} style={{ width:'150px',height:'150px' }} /> :
                    <Button style={{ width:'120px',height:'120px' }} icon={<PlusOutlined />}>Resim Yükle</Button>
                 }   
                </Upload>
                </>}
            </Form.Item>
        </Col>
        <Col span={12}>
            {/* Grid Sistemi: Durum ve Vitrin */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  style={{marginLeft:'20px'}}
                  label="Durum"
                  name="status"
                  rules={[{ required: true, message: 'Lütfen durum seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setStatus(e.target.value)} value={status}>
                    <Radio value="true">Aktif</Radio>
                    <Radio value="false">Pasif</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  style={{marginLeft:'20px'}}
                  label="Vitrin"
                  name="showcase"
                  rules={[{ required: true, message: 'Lütfen vitrin seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setShowcase(e.target.value)} value={showcase}>
                    <Radio value="true">Evet</Radio>
                    <Radio value="false">Hayır</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Col>
    </Row>
    </Form>
  </Modal>
  );
};

export default ModalForm;
