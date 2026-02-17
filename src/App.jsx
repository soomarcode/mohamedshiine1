import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Courses from './components/Courses';
import FeaturesBar from './components/FeaturesBar';
import AuthModal from './components/AuthModal';
import './index.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState('select');

  const openModal = (view = 'select') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  return (
    <div className="app">
      <Header onLogin={() => openModal('login')} />
      <Hero onCtaClick={() => openModal('select')} />
      <Courses onCourseClick={() => openModal('select')} />
      <FeaturesBar />
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView={modalView}
      />
    </div>
  );
}

export default App;
