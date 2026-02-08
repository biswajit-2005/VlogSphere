import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddVlog from './pages/AddVlog';
import VlogDetail from './pages/VlogDetail';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-vlog" element={<AddVlog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vlog/:id" element={<VlogDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
