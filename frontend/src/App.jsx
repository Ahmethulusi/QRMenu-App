// src/App.jsx
import React, { useState } from 'react';
import Menu from './components/Menu';
import Content from './components/Content';
import Header from './components/Header'; 
import './css/App.css';
import  './css/content.css';
function App() {
  const [selectedComponent, setSelectedComponent] = useState('');

  return (
  
    
    <div className="App">
      
      <Header/>
      <div className="menu-container">
        <Menu setSelectedComponent={setSelectedComponent} />
      </div>
      <div className="content">
        <Content selectedComponent={selectedComponent} />
      </div>
    </div>
  );
}

export default App;
