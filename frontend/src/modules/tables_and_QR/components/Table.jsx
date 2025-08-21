import React, { useState } from 'react';
import '../../../css/table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const Table = () => {
  const [rows, setRows] = useState([
    {
      id: 1392,
      name: 'James Yates',
      occupation: 'Web Designer',
      contact: '+63 983 0962 971',
      education: 'NY University',
      isSelected: false,
      isToggled: false,
    },
    {
      id: 4616,
      name: 'Matthew Wasil',
      occupation: 'Graphic Designer',
      contact: '+02 020 3994 929',
      education: 'London College',
      isSelected: false,
      isToggled: false,
    },
    {
      id: 9841,
      name: 'Sampson Murphy',
      occupation: 'Mobile Dev',
      contact: '+01 352 1125 0192',
      education: 'Senior High',
      isSelected: false,
      isToggled: false,
    },
    {
      id: 9548,
      name: 'Gaspar Semenov',
      occupation: 'Illustrator',
      contact: '+92 020 3994 929',
      education: 'College',
      isSelected: false,
      isToggled: false,
    },
  ]);

  const handleCheckboxChange = id => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, isSelected: !row.isSelected } : row,
      ),
    );
  };

  const handleToggleChange = id => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, isToggled: !row.isToggled } : row,
      ),
    );
    return rows;
  };

  const [record, setRecord] = useState(rows);

  const Filter = event => {
    setRecord(
      rows.filter(f => f.name.toLowerCase().includes(event.target.value)),
    );
  };

  return (
    <div className="table-container">
      <div className="btn-group" role="group">
        <button
          type="button"
          className="btn btn-primary dropdown-toggle add-button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          + Ekle
        </button>
        <ul className="dropdown-menu">
          <li className="list">Ürün</li>
          <li className="list">Kategori</li>
        </ul>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="form-control search-input"
          aria-label="Text input with segmented dropdown button"
          onChange={Filter}
        />
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Kategoriler
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <a className="dropdown-item" href="#">
              Ana Yemekler
            </a>
          </li>
          <hr className="dropdown-divider" />
          <li>
            <a className="dropdown-item" href="#">
              Aperatifler
            </a>
          </li>
          <hr className="dropdown-divider" />
          <li>
            <a className="dropdown-item" href="#">
              Çorbalar
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Tatlılar
            </a>
          </li>
        </ul>
      </div>

      <table className="table" style={{ borderRadius: '15px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>
              <input
                className="form-check-input"
                type="checkbox"
                id="check1"
                name="option1"
                value="something"
              />
            </th>
            <th>İsim</th>
            <th>Aciklama</th>
            <th>Fiyat</th>
            <th>Kategori ID</th>
            <th>Görünürlük</th>
          </tr>
        </thead>
        <tbody>
          {record.map(row => (
            <tr
              key={row.id}
              className={row.isToggled ? 'faded disabled' : ''}
              id="table-column"
            >
              <td>
                <input
                  className="form-check-input table-checkbox-left"
                  type="checkbox"
                  id="check1"
                  name="option1"
                  value="something"
                  checked={row.isSelected}
                  onChange={() => handleCheckboxChange(row.id)}
                  disabled={row.isToggled}
                />
              </td>
              <td>{row.name}</td>
              <td>{row.occupation}</td>
              <td>{row.contact}</td>
              <td>{row.education}</td>
              <td className="toggle">
                <FontAwesomeIcon
                  icon={row.isToggled ? faToggleOn : faToggleOff}
                  onClick={() => handleToggleChange(row.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
