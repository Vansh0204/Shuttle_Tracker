import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Student from './pages/Student';
import Driver from './pages/Driver';
import TrackShuttle from './pages/TrackShuttle';
import Footer from './components/Footer';
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="w-full p-8 box-border flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<Student />} />
            <Route path="/driver" element={<Driver />} />
            <Route path="/track-shuttle" element={<TrackShuttle />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
