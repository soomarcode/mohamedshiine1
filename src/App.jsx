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
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

function App() {
  // Initialize state from localStorage if available
  const [view, setView] = useState(() => localStorage.getItem('app_view') || 'home');
  const [currentCourse, setCurrentCourse] = useState(() => {
    const saved = localStorage.getItem('app_current_course');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing currentCourse from storage:', e);
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState('select');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(() => localStorage.getItem('app_preview_mode') === 'true');

  console.log('App Rendering, view:', view);

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
  }, [currentCourse]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('app_view', view);
    localStorage.setItem('app_current_course', currentCourse ? JSON.stringify(currentCourse) : '');
    localStorage.setItem('app_preview_mode', isPreviewMode ? 'true' : 'false');
  }, [view, currentCourse, isPreviewMode]);

  const openAuthModal = (view = 'select') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const handleCourseClick = (course) => {
    console.log('Selected Course:', course);
    setCurrentCourse(course);
    setIsPreviewMode(false);
    if (!user) {
      openAuthModal('signup');
    } else {
      processCourse(course);
    }
  };

  const handlePreviewClick = (course) => {
    console.log('Preview Selected:', course);
    setCurrentCourse(course);
    // Even for preview/daawo, ask for login if not logged in
    if (!user) {
      openAuthModal('signup');
    } else {
      setIsPreviewMode(true);
      setView('player');
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
    setIsPreviewMode(false);
    setIsPaymentOpen(false);
    setView('player'); // Go to player after payment
  };

  const renderView = () => {
    if (view === 'player' && currentCourse) {
      return (
        <CoursePlayer
          course={currentCourse}
          isPreviewMode={isPreviewMode}
          onBack={() => setView('home')}
          onEnroll={() => setIsPaymentOpen(true)}
        />
      );
    }

    if (view === 'admin') {
      return <AdminPanel onBack={() => setView('home')} />;
    }

    return (
      <>
        <Header
          onLogin={() => openAuthModal('login')}
          user={user}
          onAdminClick={() => setView('admin')}
        />
        <Hero onCtaClick={() => openAuthModal('select')} />
        <Courses
          onCourseClick={(c) => { console.log('Course Selected:', c); handleCourseClick(c); }}
          onPreviewClick={(c) => { console.log('Preview Selected:', c); handlePreviewClick(c); }}
        />
        <FeaturesBar />
      </>
    );
  };

  return (
    <div className="app">
      {renderView()}

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
      <WhatsAppButton />
    </div>
  );
}

export default App;
