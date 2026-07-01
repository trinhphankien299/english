import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const isAdmin  = user?.role === 'admin'
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">EnglishPro</NavLink>

      <div className="navbar-links">
        <NavLink to="/"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          end
        >🏠 Home</NavLink>

        {!isAdmin && (
          <NavLink to="/quiz"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >🎯 Làm bài thi</NavLink>
        )}

        <NavLink to="/history"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >📋 Lịch sử</NavLink>

        {isAdmin && (
          <NavLink to="/admin"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >⚙️ Quản trị</NavLink>
        )}
      </div>

      {/* User info */}
      <div className="navbar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-role">
            <span className={`role-pill ${user.role}`}>{user.role}</span>
          </div>
        </div>
      </div>

      <button className="nav-link danger" onClick={handleLogout}>
        🚪 Đăng xuất
      </button>
    </nav>
  )
}
