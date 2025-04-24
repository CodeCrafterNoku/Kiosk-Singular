import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignUp from './Components/assets/LoginSignUp/LoginSignUp';
import Product from './Components/Products/Products';
import ProductAdmin from './Components/Products_Admin/ProductAdmin';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp />} />
        <Route path="/user/products" element={<Product />} />
        <Route path="/admin/products" element={<ProductAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;