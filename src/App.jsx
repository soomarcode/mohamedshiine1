import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Courses from './components/Courses';
import FeaturesBar from './components/FeaturesBar';
import './index.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Courses />
      <FeaturesBar />
    </div>
  );
}

export default App;
