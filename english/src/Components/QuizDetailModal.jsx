import React from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizDetailModal({ record, onClose }) {
  if (!record) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="modal-title">Chi tiết bài làm</div>
            <div className="text-sm text-muted mt4">
              {record.category} · {new Date(record.date).toLocaleString('vi-VN')}
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕ Đóng</button>
        </div>

        <div style={{ overflowY: 'auto', paddingRight: 10 }}>
          {/* Summary */}
          <div className="flex gap16 mb20" style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 'var(--rsm)', border: '1px solid var(--border)' }}>
            <div><span className="text-muted text-sm">Điểm:</span> <strong style={{ fontSize: 16 }} className={record.score >= 60 ? 'text-success' : 'text-danger'}>{record.score}%</strong></div>
            <div><span className="text-muted text-sm">Số câu đúng:</span> <strong style={{ fontSize: 16 }}>{record.correct}/{record.total}</strong></div>
            {record.userName && <div><span className="text-muted text-sm">Học viên:</span> <strong>{record.userName}</strong></div>}
          </div>

          {/* Details */}
          {(!record.details || record.details.length === 0) ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon" style={{ fontSize: 32 }}>⚠️</div>
              <p>Bài làm này không lưu trữ dữ liệu câu hỏi chi tiết.</p>
            </div>
          ) : (
            <div className="flex" style={{ flexDirection: 'column', gap: 16 }}>
              {record.details.map((item, i) => (
                <div key={i} className="card" style={{ padding: 16, border: `1px solid ${item.correct ? 'var(--success)' : 'var(--danger)'}` }}>
                  <div className="flex items-c jc-sb mb12">
                    <strong style={{ fontSize: 14 }}>Câu {i + 1}</strong>
                    <span className={`badge ${item.correct ? 'badge-green' : 'badge-red'}`}>
                      {item.correct ? 'Đúng' : 'Sai'}
                    </span>
                  </div>
                  
                  <div className="question-text" style={{ fontSize: 15, marginBottom: 12 }}>{item.question}</div>
                  
                  <div className="flex" style={{ flexDirection: 'column', gap: 8 }}>
                    {item.options.map((opt, optIdx) => {
                      let bg = 'var(--surface2)'
                      let border = '1px solid var(--border)'
                      let color = 'var(--text)'
                      let icon = ''
                      
                      if (optIdx === item.answer) {
                        bg = 'rgba(16, 185, 129, 0.1)'
                        border = '1px solid var(--success)'
                        icon = ' ✓'
                      } else if (optIdx === item.selected && !item.correct) {
                        bg = 'rgba(239, 68, 68, 0.1)'
                        border = '1px solid var(--danger)'
                        icon = ' ✗'
                      }

                      return (
                        <div key={optIdx} style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--rsm)',
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontWeight: 600, 
                            marginRight: 10,
                            color: 'var(--muted)',
                            width: 20
                          }}>{LETTERS[optIdx]}</span>
                          <span>{opt}</span>
                          <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: optIdx === item.answer ? 'var(--success)' : 'var(--danger)' }}>{icon}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
