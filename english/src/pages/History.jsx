import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import { historyAPI } from '../services/api'

export default function History({ user }) {
  const isAdmin = user?.role === 'admin'

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [catFilter, setCat]   = useState('all')

  useEffect(() => {
    const load = isAdmin ? historyAPI.getAll() : historyAPI.getByUser(user.id)
    load.then(setHistory).finally(() => setLoading(false))
  }, [])

  const filtered = history.filter(h => {
    const matchS = h.category?.toLowerCase().includes(search.toLowerCase()) ||
                   h.userName?.toLowerCase().includes(search.toLowerCase())
    const matchC = catFilter === 'all' || h.category?.includes(catFilter)
    return matchS && matchC
  })

  const gradeLabel = (s) => s >= 80 ? 'Giỏi' : s >= 60 ? 'Đạt' : 'Chưa đạt'
  const gradeClass = (s) => s >= 80 ? 'badge-green' : s >= 60 ? 'badge-yellow' : 'badge-red'

  /* summary stats */
  const total   = history.length
  const avg     = total ? Math.round(history.reduce((a, h) => a + h.score, 0) / total) : 0
  const best    = total ? Math.max(...history.map(h => h.score)) : 0
  const passRate= total ? Math.round(history.filter(h => h.score >= 60).length / total * 100) : 0

  return (
    <div className="page-wrapper">
      <Header
        title="Lịch sử thi"
        subtitle={`${history.length} lượt thi${!isAdmin ? ' của bạn' : ' toàn hệ thống'}`}
      />

      {/* Summary cards */}
      {!loading && history.length > 0 && (
        <div className="grid4 mb20">
          {[
            { label: 'Tổng lượt thi', val: total,       icon: '📋', color: 'rgba(108,99,255,.18)' },
            { label: 'Điểm TB',       val: avg + '%',   icon: '🏆', color: 'rgba(16,185,129,.18)'  },
            { label: 'Điểm cao nhất', val: best + '%',  icon: '⭐', color: 'rgba(245,158,11,.18)'  },
            { label: 'Tỷ lệ đạt',     val: passRate+'%',icon: '✅', color: 'rgba(34,211,238,.18)'  },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
              <div><div className="stat-val">{s.val}</div><div className="stat-lbl">{s.label}</div></div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        {/* Filters */}
        <div className="search-row">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm chủ đề, tên..."
          />
          <select value={catFilter} onChange={e => setCat(e.target.value)}>
            <option value="all">Tất cả chủ đề</option>
            <option value="Grammar">Grammar</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Reading">Reading</option>
            <option value="Tổng hợp">Tổng hợp</option>
          </select>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không có lịch sử thi</h3>
            <p>{search ? 'Thử tìm kiếm khác' : 'Hãy làm bài thi đầu tiên!'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {isAdmin && <th>Học viên</th>}
                  <th>Chủ đề</th>
                  <th>Kết quả</th>
                  <th>Điểm</th>
                  <th>Xếp loại</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={h.id}>
                    <td className="text-muted">{i + 1}</td>
                    {isAdmin && (
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{h.userName}</td>
                    )}
                    <td><span className="badge badge-purple">{h.category}</span></td>
                    <td>{h.correct}/{h.total} câu</td>
                    <td>
                      <span className={`score-pill ${h.score >= 60 ? 'pass' : 'fail'}`}>
                        {h.score}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${gradeClass(h.score)}`}>{gradeLabel(h.score)}</span>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(h.date).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
