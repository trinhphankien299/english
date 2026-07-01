import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register({ notify }) {
  const navigate = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Vui lòng nhập họ tên'
    if (!form.email.trim())    e.email    = 'Vui lòng nhập email'
    if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự'
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password })
      notify('Đăng ký thành công! Hãy đăng nhập', 'success')
      navigate('/login')
    } catch (err) {
      setErrors({ email: err.message })
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        placeholder={placeholder}
        style={errors[name] ? { borderColor: 'var(--danger)' } : {}}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-text">EnglishPro</span>
          <p>Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field name="name"     label="Họ và tên *"       placeholder="Nguyễn Văn A" />
          <Field name="email"    label="Email *"            type="email" placeholder="you@example.com" />
          <Field name="password" label="Mật khẩu *"        type="password" placeholder="Tối thiểu 6 ký tự" />
          <Field name="confirm"  label="Xác nhận mật khẩu *" type="password" placeholder="Nhập lại mật khẩu" />

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
