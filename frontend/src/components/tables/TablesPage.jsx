import React, { useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import QRCode from "react-qr-code";
const { Option } = Select;


const TablesPage = () => {
  const [tables, setTables] = useState([
    { key: '1', tableNo: 1, status: 'Active' },
    { key: '2', tableNo: 2, status: 'Active' },
    { key: '3', tableNo: 3, status: 'Active' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form] = Form.useForm();

  const handleAddTable = (values) => {
    const newTable = {
      key: Date.now().toString(),
      tableNo: values.tableNo,
      status: 'Active',
    };
    setTables((prev) => [...prev, newTable]);
    setIsAddModalOpen(false);
    form.resetFields();
    message.success('Masa eklendi.');
  };

  const openQRModal = (table) => {
    setSelectedTable(table);
    setIsQRModalOpen(true);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Tables</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Table
        </Button>
      </div>

      <Table dataSource={tables} pagination={{ pageSize: 10 }}>
        <Table.Column title="Table No" dataIndex="tableNo" key="tableNo" />
        <Table.Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status) => (
            <Tag color={status === 'Active' ? 'green' : 'volcano'}>
              {status}
            </Tag>
          )}
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record) => (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
              >
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Space>
          )}
        />
        <Table.Column
          title="QR Code"
          key="qr"
          render={(_, record) => (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => openQRModal(record)}
            >
              Generate
            </Button>
          )}
        />
      </Table>

      {/* Add Table Modal */}
      <Modal
        title="Add New Table"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => form.submit()}
        okText="Add"
      >
      <Form form={form} layout="vertical" onFinish={handleAddTable}>
  
  {/* Durum seçimi — masa numarasının üstüne alındı */}
  {/* Masa numarası */}
  <Form.Item
    name="tableNo"
    label="Masa Numarası"
    rules={[{ required: true, message: 'Lütfen masa numarası girin' }]}
  >
     <InputNumber min={1} style={{ width: '100%' }} />
  </Form.Item>
  <Form.Item
    name="status"
    label="Durum"
    rules={[{ required: true, message: 'Lütfen bir durum seçin' }]}
  >
    <Select placeholder="Bir durum seç" allowClear>
      <Select.Option value="Active">Aktif</Select.Option>
      <Select.Option value="Inactive">Pasif</Select.Option>
    </Select>
 
  </Form.Item>

</Form>

      </Modal>
<Modal
  title={`QR Code - Table ${selectedTable?.tableNo}`}
  open={isQRModalOpen}
  onCancel={() => setIsQRModalOpen(false)}
  footer={null}
>
  {selectedTable && (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <div style={{ background: 'white', padding: '16px', display: 'inline-block' }}>
        <QRCode
          value={`https://qrmenu-app-frontend.onrender.com/${selectedTable.tableNo}`}
          size={200} // Bu kütüphane aslında otomatik olarak kare boyutlandırır, size opsiyoneldir
        />
      </div>
      <p style={{ marginTop: 12 }}>
        URL: <br />
        <code>https://qrmenu-app-frontend.onrender.com</code>
      </p>
    </div>
  )}
</Modal>
    </>
  );
};

export default TablesPage;
