import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import Courses from './components/Courses';
import FeaturesBar from './components/FeaturesBar';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import CoursePlayer from './components/CoursePlayer';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState('select');
  const [user, setUser] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'player', 'admin'
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN') {
        setIsModalOpen(false); // Close auth modal
        // If we were waiting to access a course, do it now
        if (currentCourse) {
          processCourse(currentCourse);
        }
      } else if (event === 'SIGNED_OUT') {
        setView('home');
        setCurrentCourse(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentCourse]); // Re-bind if currentCourse changes to catch SIGNED_IN properly

  const openAuthModal = (view = 'select') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const handleCourseClick = (course) => {
    console.log('Selected Course:', course); // Debugging
    setCurrentCourse(course);
    if (!user) {
      openAuthModal('signup');
    } else {
      processCourse(course);
    }
  };

  const processCourse = (course) => {
    if (!course) return;
    if (course.type === 'free') {
      setView('player');
    } else {
      setIsPaymentOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // User logic handled by onAuthStateChange
    setIsModalOpen(false);
    if (currentCourse) {
      processCourse(currentCourse);
    }
  };

  const handlePaymentComplete = () => {
    setIsPaymentOpen(false);
    setView('player'); // Go to player after payment
  };

  if (view === 'player' && currentCourse) {
    return <CoursePlayer course={currentCourse} onBack={() => setView('home')} />;
  }

  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('home')} />;
  }

  return (
    <div className="app">
      <Header
        onLogin={() => openAuthModal('login')}
        user={user}
        onAdminClick={() => setView('admin')}
      />
      <Hero onCtaClick={() => openAuthModal('select')} />
      <Courses onCourseClick={handleCourseClick} />
      <FeaturesBar />

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView={modalView}
        onLoginSuccess={handleLoginSuccess}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        course={currentCourse}
        onClose={() => setIsPaymentOpen(false)}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default App;
