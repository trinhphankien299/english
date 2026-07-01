import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Components/Header'
import { questionAPI, historyAPI } from '../services/api'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Quiz({ user, notify }) {
  const navigate = useNavigate()

  const [allQuestions, setAll]     = useState([])
  const [loading,      setLoading] = useState(true)
  const [phase,        setPhase]   = useState('setup') // setup | taking
  const [quizMeta,     setMeta]    = useState(null)    // { questions, category }

  // Setup form
  const [cat,   setCat]   = useState('all')
  const [diff,  setDiff]  = useState('all')
  const [count, setCount] = useState(10)

  useEffect(() => {
    questionAPI.getAll()
      .then(setAll)
      .catch(() => notify('Không thể tải câu hỏi', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const available = allQuestions.filter(q => {
    const mc = cat  === 'all' || q.category  === cat
    const md = diff === 'all' || q.difficulty === diff
    return mc && md
  })
  const realCount = Math.min(count, available.length)

  const handleStart = () => {
    if (!available.length) { notify('Không có câu hỏi phù hợp', 'error'); return }
    const shuffled = [...available].sort(() => Math.random() - .5).slice(0, realCount)
    const label    = `${cat === 'all' ? 'Tổng hợp' : cat}${diff !== 'all' ? ' · ' + diff : ''}`
    setMeta({ questions: shuffled, category: label })
    setPhase('taking')
  }

  const handleFinish = async (result) => {
    try {
      await historyAPI.create({
        userId:   user.id,
        userName: user.name,
        category: quizMeta.category,
        difficulty: diff,
        total:    result.total,
        correct:  result.correct,
        score:    result.score,
      })
    } catch { /* non-critical */ }
    navigate('/result', { state: { result, category: quizMeta.category } })
    notify(`Hoàn thành! Điểm: ${result.score}%`)
  }

  if (loading) return <div className="page-wrapper"><div className="spinner-wrap"><div className="spinner" /></div></div>

  if (phase === 'taking')
    return <TakingScreen questions={quizMeta.questions} onFinish={handleFinish} onCancel={() => setPhase('setup')} />

  /* ── SETUP SCREEN ── */
  const diffLabel = { all: 'Tất cả', easy: '🟢 Dễ', medium: '🟡 Trung bình', hard: '🔴 Khó' }

  return (
    <div className="page-wrapper">
      <Header title="Làm bài thi 🎯" subtitle="Chọn cài đặt rồi bắt đầu luyện tập" />

      <div className="grid2">
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 22 }}>Cài đặt bài thi</h3>

          <div className="form-group">
            <label>Chủ đề</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              <option value="all">Tất cả chủ đề</option>
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Reading">Reading</option>
            </select>
          </div>

          <div className="form-group">
            <label>Độ khó</label>
            <select value={diff} onChange={e => setDiff(e.target.value)}>
              <option value="all">Tất cả độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Số câu: <strong style={{ color: 'var(--accent)' }}>{realCount}</strong>
              {available.length < count && (
                <span style={{ color: 'var(--warn)', fontSize: 11 }}> (tối đa {available.length})</span>
              )}
            </label>
            <input
              type="range" min={5} max={Math.max(5, available.length)} step={5}
              value={count} onChange={e => setCount(+e.target.value)}
              style={{ padding: 0, height: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <div className="flex jc-sb text-sm text-muted mt8">
              <span>5</span><span>{Math.max(5, available.length)}</span>
            </div>
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 'var(--rsm)', border: '1px solid var(--border)', marginBottom: 22, fontSize: 13, lineHeight: 2 }}>
            <div className="text-muted" style={{ marginBottom: 4, fontWeight: 600 }}>Tóm tắt bài thi</div>
            <div>📚 Chủ đề: <strong>{cat === 'all' ? 'Tổng hợp' : cat}</strong></div>
            <div>🎯 Độ khó: <strong>{diffLabel[diff]}</strong></div>
            <div>📝 Số câu: <strong>{realCount} câu</strong></div>
          </div>

          <button
            className="btn btn-primary w-full btn-lg"
            onClick={handleStart}
            disabled={!available.length}
          >
            {!available.length ? '⚠️ Không có câu phù hợp' : 'Bắt đầu làm bài →'}
          </button>
        </div>

        {/* Guide */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Hướng dẫn</h3>
          {[
            ['🎯', 'Chọn đáp án',        'Mỗi câu có 4 đáp án, chỉ 1 đúng. Sau khi chọn sẽ hiện kết quả ngay.'],
            ['⏱️', 'Không giới hạn thời gian', 'Hãy suy nghĩ kỹ trước khi chọn đáp án.'],
            ['✅', 'Phản hồi tức thì',   'Màu xanh = đúng, màu đỏ = sai.'],
            ['📊', 'Lưu lịch sử tự động','Kết quả được lưu vào lịch sử cá nhân sau khi hoàn thành.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
                <div className="text-sm text-muted">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ TAKING SCREEN ═══════════════════ */
function TakingScreen({ questions, onFinish, onCancel }) {
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers,  setAnswers]  = useState([])

  const q   = questions[idx]
  const pct = (idx / questions.length) * 100

  const pick = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    setAnswers(prev => [...prev, { correct: i === q.answer }])
  }

  const next = () => {
    if (idx + 1 >= questions.length) {
      const correct = answers.filter(a => a.correct).length
      onFinish({ total: questions.length, correct, score: Math.round(correct / questions.length * 100) })
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="quiz-wrap">
        {/* Top bar */}
        <div className="flex items-c jc-sb mb16">
          <span className="text-sm text-muted">Câu {idx + 1} / {questions.length}</span>
          <div className="flex gap8">
            <span className="badge badge-green">{answers.filter(a => a.correct).length} đúng</span>
            <span className="badge badge-red">{answers.filter(a => !a.correct).length} sai</span>
            <button className="btn btn-outline btn-sm" onClick={onCancel}>✕ Thoát</button>
          </div>
        </div>

        {/* Progress */}
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: pct + '%' }} />
        </div>

        {/* Question card */}
        <div className="card">
          <div className="flex gap8 mb16">
            <span className="badge badge-purple">{q.category}</span>
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'}`}>
              {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
            </span>
          </div>
          <div className="question-text">{q.question}</div>

          {q.options?.map((opt, i) => {
            let cls = ''
            if (revealed) {
              if (i === q.answer) cls = 'correct'
              else if (i === selected) cls = 'wrong'
            } else if (i === selected) cls = 'selected'

            return (
              <button
                key={i}
                className={`option-btn ${cls} ${revealed ? 'revealed' : ''}`}
                onClick={() => pick(i)}
              >
                <span className="option-letter">{LETTERS[i]}</span>
                {opt}
                {revealed && i === q.answer  && <span style={{ marginLeft: 'auto' }}>✓</span>}
                {revealed && i === selected && i !== q.answer && <span style={{ marginLeft: 'auto' }}>✗</span>}
              </button>
            )
          })}

          {revealed && (
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={next}>
                {idx + 1 >= questions.length ? '🏆 Xem kết quả' : 'Câu tiếp theo →'}
              </button>
            </div>
          )}
        </div>

        {/* Dot progress */}
        <div className="flex gap4 mt16" style={{ flexWrap: 'wrap' }}>
          {questions.map((_, i) => {
            const cls = i < answers.length
              ? answers[i].correct ? 'done-correct' : 'done-wrong'
              : i === idx ? 'current' : ''
            return (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: cls === 'done-correct' ? 'var(--success)'
                  : cls === 'done-wrong' ? 'var(--danger)'
                  : cls === 'current'    ? 'var(--accent)'
                  : 'var(--surface3)',
                transition: 'background .3s'
              }} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
