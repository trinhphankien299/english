import React, { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar   from './Components/Navbar'
import Login    from './pages/Login'
import Register from './pages/Register'
import Home     from './pages/Home'
import Quiz     from './pages/Quiz'
import Result   from './pages/Result'
import History  from './pages/History'
import Admin    from './pages/Admin'

/* ── TOAST ── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon" style={{
            color: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--accent)'
          }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

/* ── PROTECTED ROUTE ── */
function PrivateRoute({ user, adminOnly, children }) {
  if (!user)              return <Navigate to="/login"   replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  /* Auth */
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eq_user')) } catch { return null }
  })

  const handleLogin = (u) => {
    setUser(u)
    localStorage.setItem('eq_user', JSON.stringify(u))
  }
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('eq_user')
  }

  /* Toast */
  const [toasts, setToasts] = useState([])
  const notify = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Public */}
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login    onLogin={handleLogin} notify={notify} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register notify={notify} />} />

        {/* Protected – all roles */}
        <Route path="/" element={
          <PrivateRoute user={user}>
            <Home user={user} />
          </PrivateRoute>
        }/>
        <Route path="/quiz" element={
          <PrivateRoute user={user}>
            <Quiz user={user} notify={notify} />
          </PrivateRoute>
        }/>
        <Route path="/result" element={
          <PrivateRoute user={user}>
            <Result />
          </PrivateRoute>
        }/>
        <Route path="/history" element={
          <PrivateRoute user={user}>
            <History user={user} />
          </PrivateRoute>
        }/>

        {/* Admin only */}
        <Route path="/admin" element={
          <PrivateRoute user={user} adminOnly>
            <Admin notify={notify} />
          </PrivateRoute>
        }/>

        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>

      <ToastContainer toasts={toasts} />
    </>
  )
}
