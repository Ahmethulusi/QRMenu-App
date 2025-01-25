// import React, { useState, useEffect } from 'react';
// import { Table, Button } from 'react-bootstrap';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import '../foods.css';
// import '../foods.css';

// function Foods() {
//   const [Foods, setFoods] = useState([]);
//   useEffect(() => {
//     fetchFoods();
//   }, []);

//   function Foods() {
//     const [Foods, setFoods] = useState([]);
//     const [error, setError] = useState('');

//     const fetchFoods = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/products', {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         });

//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         setFoods(data);
//         setError('');
//       } catch (error) {
//         console.error('Bir hata oluştu', error);
//         setError('Veriler alınamadı. Lütfen tekrar deneyin.');
//       }
//     };

//     return (
//       <div>
//         <h1 className="foods-title">Foods List</h1>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <table className="foods-table" cell stripped hover>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Description</th>
//               <th>Visible</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Foods.map(food => (
//               <tr key={food.id}>
//                 <td>{food.name}</td>
//                 <td>{food.price}</td>
//                 <td>{food.description}</td>
//                 <td>{food.visible ? 'Yes' : 'No'}</td>
//                 <td>
//                   <button
//                     onClick={() =>
//                       handleUpdate(food.id, { ...food, visible: !food.visible })
//                     }
//                   >
//                     {food.visible ? 'Hide' : 'Show'}
//                   </button>
//                   <button
//                     onClick={() =>
//                       handleUpdate(food.id, { ...food, name: 'Updated Name' })
//                     }
//                   >
//                     Edit
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }
// }
// export default Foods;
