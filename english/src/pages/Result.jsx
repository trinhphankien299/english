import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../Components/Header'

export default function Result() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  if (!state?.result) {
    navigate('/')
    return null
  }

  const { total, correct, score } = state.result
  const wrong    = total - correct
  const pass     = score >= 60
  const category = state.category || 'Tổng hợp'

  const grade =
    score >= 90 ? { label: 'Xuất sắc', color: '#10b981', emoji: '🥇' } :
    score >= 80 ? { label: 'Giỏi',     color: '#22d3ee', emoji: '🥈' } :
    score >= 60 ? { label: 'Đạt',      color: '#f59e0b', emoji: '🥉' } :
                  { label: 'Chưa đạt', color: '#ef4444', emoji: '💪' }

  return (
    <div className="page-wrapper">
      <Header title="Kết quả bài thi 🏆" subtitle={category} />

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card text-center" style={{ marginBottom: 20 }}>
          {/* Score ring */}
          <div className="result-ring" style={{ '--pct': score }}>
            <div className="result-score">{score}%</div>
          </div>

          {/* Grade badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 24px', borderRadius: 24, marginBottom: 24,
            background: pass ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
            border: `1px solid ${pass ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
            color: pass ? 'var(--success)' : 'var(--danger)',
            fontWeight: 700, fontSize: 16,
          }}>
            {grade.emoji} {grade.label}
          </div>

          {/* Stats */}
          <div className="grid3" style={{ maxWidth: 420, margin: '0 auto 28px' }}>
            <div className="stat-card" style={{ flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <div className="stat-val" style={{ color: 'var(--text)' }}>{total}</div>
              <div className="stat-lbl">Tổng câu</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <div className="stat-val" style={{ color: 'var(--success)' }}>{correct}</div>
              <div className="stat-lbl">Câu đúng</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <div className="stat-val" style={{ color: 'var(--danger)' }}>{wrong}</div>
              <div className="stat-lbl">Câu sai</div>
            </div>
          </div>

          <p className="text-muted" style={{ fontSize: 15, marginBottom: 28 }}>
            {pass
              ? '🎉 Tuyệt vời! Bạn đã vượt qua bài thi. Tiếp tục duy trì nhé!'
              : '💪 Đừng nản lòng! Ôn tập thêm và thử lại nhé!'}
          </p>

          <div className="flex jc-c gap12">
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/quiz')}>
              🔄 Làm bài khác
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/history')}>
              📋 Xem lịch sử
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
