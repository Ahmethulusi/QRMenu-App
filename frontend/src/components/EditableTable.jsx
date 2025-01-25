// import React, { useState ,useEffect} from 'react';
// import { Table ,Input,Form} from 'antd';

// const App = () => {
//   const [dataSource, setDataSource] = useState([
//     { id: 1, name: 'Product A', price: 100 },
//     { id: 2, name: 'Product B', price: 200 },
//     // Diğer ürünler...
//   ]);

//   const handleSave = (row) => {
//     const newData = [...dataSource];
//     const index = newData.findIndex((item) => row.id === item.id);
//     const item = newData[index];
//     newData.splice(index, 1, { ...item, ...row });
//     setDataSource(newData);
//   };

//   const columns = [
//     {
//       title: 'Name',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text) => (
//         <span>{text}</span>
//       ),
//     },
//     {
//       title: 'Price',
//       dataIndex: 'price',
//       key: 'price',
//       editable: true, // Bu sütunu düzenlenebilir hale getiriyoruz
//       width:'10%'
//     },
//     {
//       title: 'Action',
//       dataIndex: '',
//       key: 'x',
//       width: '30%',
//       render: () => (
//         <div className='action-buttons-container'>
//           <a className='add-button'>Add</a>
//           <a className='edit-button'>Edit</a>
//           <a className='delete-button' > Delete</a>
//         </div>
//       ),
//     },
//   ];

//   const mergedColumns = columns.map((col) => {
//     if (!col.editable) {
//       return col;
//     }

//     return {
//       ...col,
//       onCell: (record) => ({
//         record,
//         editable: col.editable,
//         dataIndex: col.dataIndex,
//         title: col.title,
//         handleSave: handleSave,
//       }),
//     };
//   });

//   return (
//     <Table
//       columns={mergedColumns}
//       dataSource={dataSource}
//       rowKey="id"
//       components={{
//         body: {
//           cell: EditableCell, // Hücre bileşenini tabloya bağladık
//         },
//       }}
//       pagination={{
//         pageSize: 5,
//       }}
//     />
//   );
// };

// export default App;




// const EditableCell = ({
//   title,
//   editable,
//   children,
//   dataIndex,
//   record,
//   handleSave,
//   ...restProps
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (editing) {
//       form.setFieldsValue({ [dataIndex]: record[dataIndex] });
//     }
//   }, [editing, form, dataIndex, record]);

//   const toggleEdit = () => {
//     setEditing(!editing);
//     if (editing) {
//       form.submit();
//     }
//   };

//   const save = async () => {
//     try {
//       const values = await form.validateFields();
//       toggleEdit();
//       handleSave({ ...record, ...values });
//     } catch (errInfo) {
//       console.log('Save failed:', errInfo);
//     }
//   };

//   let childNode = children;

//   if (editable) {
//     childNode = editing ? (
//       <Form form={form} component={false}>
//         <Form.Item
//           style={{ margin: 0 }}
//           name={dataIndex}
//           rules={[{ required: true, message: `${title} boş olamaz.` }]}
//         >
//           <Input onPressEnter={save} onBlur={save} />
//         </Form.Item>
//       </Form>
//     ) : (
//       <div onClick={toggleEdit}>
//         {children}
//       </div>
//     );
//   }

//   return <td {...restProps}>{childNode}</td>;
// };

