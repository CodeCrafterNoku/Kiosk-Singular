import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginSignUp from './Components/assets/LoginSignUp/LoginSignUp';
import Product from './Components/Products/Products';
import ProductAdmin from './Components/Products_Admin/ProductAdmin';
import Navigation from './Components/Navigation/Nav';
import OrderDisplay from './Components/Navigation/OrderDisplay'; // Ensure this is correct



function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Navigation />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginSignUp />} />
          <Route path="/user/products" element={<Product />} />
          <Route path="/admin/products" element={<ProductAdmin />} />
           <Route path="/orders" element={<OrderDisplay />} /> {/* Add Orders Route */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
