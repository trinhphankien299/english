import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Components/Header'
import { questionAPI, historyAPI, userAPI } from '../services/api'

export default function Home({ user }) {
  const navigate  = useNavigate()
  const isAdmin   = user?.role === 'admin'

  const [questions, setQuestions] = useState([])
  const [history,   setHistory]   = useState([])
  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [qs, hist] = await Promise.all([
          questionAPI.getAll(),
          isAdmin ? historyAPI.getAll() : historyAPI.getByUser(user.id)
        ])
        setQuestions(qs)
        setHistory(hist)
        if (isAdmin) {
          const us = await userAPI.getAll()
          setUsers(us)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const avgScore  = history.length ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length) : 0
  const bestScore = history.length ? Math.max(...history.map(h => h.score)) : 0
  const recent    = history.slice(0, 6)

  const adminStats = [
    { label: 'Câu hỏi',    val: questions.length, icon: '📝', color: 'rgba(108,99,255,.18)' },
    { label: 'Người dùng', val: users.length,     icon: '👥', color: 'rgba(168,85,247,.18)' },
    { label: 'Lượt thi',   val: history.length,   icon: '📋', color: 'rgba(34,211,238,.18)'  },
    { label: 'Điểm TB',    val: avgScore + '%',   icon: '🏆', color: 'rgba(16,185,129,.18)'  },
  ]
  const userStats = [
    { label: 'Lượt thi',      val: history.length,  icon: '📋', color: 'rgba(108,99,255,.18)' },
    { label: 'Điểm TB',       val: avgScore + '%',  icon: '🏆', color: 'rgba(16,185,129,.18)'  },
    { label: 'Điểm cao nhất', val: bestScore + '%', icon: '⭐', color: 'rgba(245,158,11,.18)'  },
    { label: 'Câu hỏi',       val: questions.length, icon: '📝', color: 'rgba(34,211,238,.18)' },
  ]
  const stats = isAdmin ? adminStats : userStats

  const catCount  = (c) => questions.filter(q => q.category  === c).length
  const diffCount = (d) => questions.filter(q => q.difficulty === d).length

  if (loading) return <div className="page-wrapper"><div className="spinner-wrap"><div className="spinner" /></div></div>

  return (
    <div className="page-wrapper">
      <Header
        title={`Chào mừng, ${user?.name} 👋`}
        subtitle={isAdmin ? 'Tổng quan hệ thống luyện thi' : 'Hôm nay bạn muốn ôn luyện gì?'}
      />

      {/* Stats */}
      <div className="grid4 mb20">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid2">
        {/* Recent history */}
        <div className="card">
          <div className="flex items-c jc-sb mb16">
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>Lịch sử gần đây</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/history')}>
              Xem tất cả →
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Chưa có lịch sử thi</h3>
              {!isAdmin && <p>Hãy làm bài thi đầu tiên!</p>}
            </div>
          ) : recent.map(h => (
            <div key={h.id} className="flex items-c jc-sb" style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                {isAdmin && <div className="text-sm text-muted">{h.userName}</div>}
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{h.category}</div>
                <div className="text-sm text-muted">
                  {new Date(h.date).toLocaleDateString('vi-VN')} · {h.correct}/{h.total} câu
                </div>
              </div>
              <span className={`score-pill ${h.score >= 60 ? 'pass' : 'fail'}`}>{h.score}%</span>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {isAdmin ? (
          <div className="card">
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 18 }}>Phân bố câu hỏi</h3>
            {['Grammar', 'Vocabulary', 'Reading'].map(cat => {
              const c   = catCount(cat)
              const pct = questions.length ? Math.round(c / questions.length * 100) : 0
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div className="flex jc-sb" style={{ fontSize: 13, marginBottom: 5 }}>
                    <span>{cat}</span>
                    <span className="text-muted">{c} câu ({pct}%)</span>
                  </div>
                  <div className="mini-bar-wrap">
                    <div className="mini-bar" style={{ width: pct + '%' }} />
                  </div>
                </div>
              )
            })}
            <hr className="divider" />
            <div style={{ fontSize: 13, marginBottom: 8, color: 'var(--text2)', fontWeight: 600 }}>Theo độ khó</div>
            <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-green">Dễ: {diffCount('easy')}</span>
              <span className="badge badge-yellow">TB: {diffCount('medium')}</span>
              <span className="badge badge-red">Khó: {diffCount('hard')}</span>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 280 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎯</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
              Sẵn sàng làm bài?
            </h3>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 28 }}>
              Có <strong style={{ color: 'var(--accent)' }}>{questions.length}</strong> câu hỏi đang chờ bạn
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/quiz')}>
              Bắt đầu thi ngay →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
