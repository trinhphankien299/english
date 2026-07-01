import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Login({ onLogin, notify }) {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !pass) { setError('Vui lòng nhập đầy đủ thông tin'); return }
    setLoading(true); setError('')
    try {
      const user = await authAPI.login(email, pass)
      onLogin(user)
      notify(`Chào mừng, ${user.name}!`, 'success')
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-text">EnglishPro</span>
          <p>Luyện thi Tiếng Anh thông minh</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" autoFocus
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@englishpro.vn"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--rsm)', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </div>

        <div className="auth-demo">
          🔑 Admin: <strong>admin@englishpro.vn</strong> / <strong>admin123</strong><br />
          👤 User: <strong>user@englishpro.vn</strong> / <strong>user123</strong>
        </div>
      </div>
    </div>
  )
}
