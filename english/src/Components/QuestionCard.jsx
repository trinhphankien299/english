import React, { useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * QuestionCard – form modal for creating/editing a question.
 * Props: mode ('add'|'edit'), question (obj|null), onSave(data), onClose()
 */
export default function QuestionCard({ mode, question, onSave, onClose }) {
  const [form, setForm] = useState(
    question
      ? { ...question }
      : { question: '', category: 'Grammar', difficulty: 'easy', options: ['', '', '', ''], answer: 0 }
  )
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const setOpt = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm({ ...form, options: opts })
  }

  const validate = () => {
    const e = {}
    if (!form.question.trim()) e.question = 'Vui lòng nhập nội dung câu hỏi'
    form.options.forEach((o, i) => { if (!o.trim()) e[`opt${i}`] = 'required' })
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try { await onSave(form) } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {mode === 'add' ? '➕ Thêm câu hỏi mới' : '✏️ Chỉnh sửa câu hỏi'}
          </span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Question content */}
        <div className="form-group">
          <label>Nội dung câu hỏi *</label>
          <textarea
            rows={3}
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="Nhập câu hỏi tiếng Anh..."
            style={errors.question ? { borderColor: 'var(--danger)' } : {}}
          />
          {errors.question && <div className="form-error">{errors.question}</div>}
        </div>

        {/* Category + Difficulty */}
        <div className="form-2col mb16">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Chủ đề</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Reading">Reading</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Độ khó</label>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">🟢 Dễ</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="hard">🔴 Khó</option>
            </select>
          </div>
        </div>

        {/* Answer options */}
        <div className="form-group">
          <label>Đáp án — nhấn chữ cái để chọn đáp án đúng</label>
          {LETTERS.map((letter, i) => (
            <div className="opt-row" key={i}>
              <div
                className={`opt-circle ${form.answer === i ? 'correct' : ''}`}
                onClick={() => setForm({ ...form, answer: i })}
                title="Đặt làm đáp án đúng"
              >
                {form.answer === i ? '✓' : letter}
              </div>
              <input
                value={form.options[i]}
                onChange={e => setOpt(i, e.target.value)}
                placeholder={`Đáp án ${letter}`}
                style={errors[`opt${i}`] ? { borderColor: 'var(--danger)' } : {}}
              />
            </div>
          ))}
          <div className="form-hint">
            Đáp án đúng: <strong style={{ color: 'var(--success)' }}>{LETTERS[form.answer]}</strong>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? '⏳ Đang lưu...' : mode === 'add' ? 'Thêm câu hỏi' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}
