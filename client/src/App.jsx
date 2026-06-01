import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BoardPage from './pages/BoardPage'
import Habits from './pages/Habits'
import Journal from './pages/Journal'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

// Global helper to apply stored theme and brand accent color tokens to root element
export const applyThemeAndAccent = () => {
  const theme = localStorage.getItem('theme') || 'dark';
  const accent = localStorage.getItem('accentColor') || 'indigo';

  // Apply Theme
  if (theme === 'light') {
    document.documentElement.classList.add('light-mode');
    document.documentElement.style.colorScheme = 'light';
  } else {
    document.documentElement.classList.remove('light-mode');
    document.documentElement.style.colorScheme = 'dark';
  }

  // Accent Color Mapping
  const accents = {
    indigo: { primary: '#6366F1', soft: '#818CF8', glow: 'rgba(99,102,241,0.35)' },
    emerald: { primary: '#10B981', soft: '#34D399', glow: 'rgba(16,185,129,0.35)' },
    amber: { primary: '#F59E0B', soft: '#FBBF24', glow: 'rgba(245,158,11,0.35)' },
    rose: { primary: '#F43F5E', soft: '#FB7185', glow: 'rgba(244,63,94,0.35)' },
    cyan: { primary: '#06B6D4', soft: '#22D3EE', glow: 'rgba(6,182,212,0.35)' }
  };

  const selected = accents[accent] || accents.indigo;
  document.documentElement.style.setProperty('--primary', selected.primary);
  document.documentElement.style.setProperty('--primary-soft', selected.soft);
  document.documentElement.style.setProperty('--primary-glow', selected.glow);
  document.documentElement.style.setProperty('--shadow-glow', `0 0 24px ${selected.glow}`);
};

function App() {
  // Apply visual configurations on startup
  useEffect(() => {
    applyThemeAndAccent();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/board/:id" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
