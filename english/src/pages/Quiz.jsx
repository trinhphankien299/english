import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Components/Header'
import { questionAPI, historyAPI } from '../services/api'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Quiz({ user, notify }) {
  const navigate = useNavigate()

  const [allQuestions, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('setup') // setup | taking
  const [quizMeta, setMeta] = useState(null)    // { questions, category }

  // Save progress
  const [savedProgress, setSavedProgress] = useState(null)

  // Setup form
  const [selectedExam, setSelectedExam] = useState('')
  const [questionCount, setQuestionCount] = useState('all')

  const checkSavedProgress = () => {
    if (!selectedExam) return
    const saved = localStorage.getItem(`quiz_progress_${user.id}_${selectedExam}_${questionCount}`)
    if (saved) {
      try {
        setSavedProgress(JSON.parse(saved))
      } catch (e) {
        setSavedProgress(null)
      }
    } else {
      setSavedProgress(null)
    }
  }

  useEffect(() => {
    checkSavedProgress()
  }, [user.id, phase, selectedExam, questionCount])

  const exams = Array.from(new Set(allQuestions.map(q => q.category))).sort()

  useEffect(() => {
    if (exams.length > 0 && !selectedExam) {
      setSelectedExam(exams[0])
    }
  }, [exams, selectedExam])

  useEffect(() => {
    questionAPI.getAll()
      .then(setAll)
      .catch(() => notify('Không thể tải câu hỏi', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const available = allQuestions.filter(q => q.category === selectedExam)
  const actualCount = questionCount === 'all'
    ? available.length
    : Math.min(parseInt(questionCount, 10), available.length)

  const handleStart = () => {
    if (!available.length) { notify('Không có câu hỏi trong đề này', 'error'); return }
    const shuffled = [...available].sort(() => Math.random() - .5).slice(0, actualCount)
    setMeta({ questions: shuffled, category: selectedExam, questionCount })
    setPhase('taking')
  }

  const handleFinish = async (result) => {
    try {
      await historyAPI.create({
        userId: user.id,
        userName: user.name,
        category: quizMeta.category,
        total: result.total,
        correct: result.correct,
        score: result.score,
        details: result.details,
      })
    } catch { /* non-critical */ }
    navigate('/result', { state: { result, category: quizMeta.category } })
    notify(`Hoàn thành! Điểm: ${result.score}%`)
  }

  if (loading) return <div className="page-wrapper"><div className="spinner-wrap"><div className="spinner" /></div></div>

  if (phase === 'taking')
    return <TakingScreen
      questions={quizMeta.questions}
      category={quizMeta.category}
      questionCount={quizMeta.questionCount}
      user={user}
      onFinish={handleFinish}
      onCancel={() => setPhase('setup')}
    />

  /* ── SETUP SCREEN ── */
  return (
    <div className="page-wrapper">
      <Header title="Làm bài thi 🎯" subtitle="Chọn đề thi rồi bắt đầu luyện tập" />

      <div className="grid2">
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 22 }}>Cài đặt bài thi</h3>

          <div className="form-group">
            <label>Chọn Đề Thi</label>
            <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
              {exams.map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Số lượng câu hỏi</label>
            <select value={questionCount} onChange={e => setQuestionCount(e.target.value)}>
              <option value="10">10 câu</option>
              <option value="20">20 câu</option>
              <option value="30">30 câu</option>
              <option value="40">40 câu</option>
              <option value="50">50 câu</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          {savedProgress ? (
            <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 'var(--rsm)', marginBottom: 22, marginTop: 22, border: '1px solid var(--accent)' }}>
              <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Bạn có bài thi đang làm</div>
              <div className="text-sm text-muted mb16">
                Đề thi: <strong>{savedProgress.category}</strong><br />
                Đã làm: {savedProgress.takingState?.answers?.length || 0} / {savedProgress.questions?.length || 0} câu.
              </div>
              <div className="flex gap8">
                <button className="btn btn-primary" onClick={() => {
                  setMeta({ questions: savedProgress.questions, category: savedProgress.category, questionCount: savedProgress.questionCount })
                  setPhase('taking')
                }}>Tiếp tục làm bài</button>
                <button className="btn btn-outline" onClick={() => {
                  localStorage.removeItem(`quiz_progress_${user.id}_${selectedExam}_${questionCount}`)
                  setSavedProgress(null)
                }}>Bỏ bài cũ để bắt đầu mới</button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 'var(--rsm)', border: '1px solid var(--border)', marginBottom: 22, marginTop: 22, fontSize: 13, lineHeight: 2 }}>
                <div className="text-muted" style={{ marginBottom: 4, fontWeight: 600 }}>Tóm tắt đề thi</div>
                <div>📚 Đề: <strong>{selectedExam}</strong></div>
                <div>📝 Có sẵn: <strong>{available.length} câu</strong></div>
                <div>🎯 Sẽ làm: <strong>{actualCount} câu</strong></div>
              </div>

              <button
                className="btn btn-primary w-full btn-lg"
                onClick={handleStart}
                disabled={!available.length}
              >
                {!available.length ? '⚠️ Đề thi trống' : 'Bắt đầu làm bài →'}
              </button>
            </>
          )}
        </div>

        {/* Guide */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Hướng dẫn</h3>
          {[
            ['🎯', 'Chọn đáp án', 'Mỗi câu có 4 đáp án, chỉ 1 đúng. Sau khi chọn sẽ hiện kết quả ngay.'],
            ['⏱️', 'Không giới hạn thời gian', 'Hãy suy nghĩ kỹ trước khi chọn đáp án.'],
            ['✅', 'Phản hồi tức thì', 'Màu xanh = đúng, màu đỏ = sai.'],
            ['📊', 'Lưu lịch sử tự động', 'Kết quả được lưu vào lịch sử cá nhân sau khi hoàn thành.'],
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
function TakingScreen({ questions, onFinish, onCancel, user, category, questionCount }) {
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(`quiz_progress_${user.id}_${category}_${questionCount}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.category === category && parsed.questionCount === questionCount) {
          return parsed.takingState
        }
      }
    } catch (e) { }
    return null
  }

  const initial = getInitialState()

  const [idx, setIdx] = useState(initial?.idx || 0)
  const [selected, setSelected] = useState(initial?.selected ?? null)
  const [revealed, setRevealed] = useState(initial?.revealed || false)
  const [answers, setAnswers] = useState(initial?.answers || [])
  const [bookmarks, setBookmarks] = useState(initial?.bookmarks || [])

  useEffect(() => {
    const stateToSave = {
      category,
      questionCount,
      questions,
      takingState: { idx, selected, revealed, answers, bookmarks }
    }
    localStorage.setItem(`quiz_progress_${user.id}_${category}_${questionCount}`, JSON.stringify(stateToSave))
  }, [idx, selected, revealed, answers, bookmarks, category, questionCount, questions, user.id])

  const q = questions[idx]
  const pct = (idx / questions.length) * 100

  const toggleBookmark = () => {
    setBookmarks(prev => prev.includes(idx) ? prev.filter(b => b !== idx) : [...prev, idx])
  }

  const pick = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    setAnswers(prev => [...prev, { selected: i, correct: i === q.answer }])
  }

  const next = () => {
    let currentAnswers = answers;
    if (!revealed) {
      const skippedAnswer = { selected: null, correct: false };
      currentAnswers = [...answers, skippedAnswer];
      setAnswers(currentAnswers);
    }

    if (idx + 1 >= questions.length) {
      localStorage.removeItem(`quiz_progress_${user.id}_${category}_${questionCount}`)
      const correct = currentAnswers.filter(a => a.correct).length
      onFinish({
        total: questions.length,
        correct,
        score: Math.round(correct / questions.length * 100),
        details: questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          selected: currentAnswers[i]?.selected ?? null,
          correct: currentAnswers[i]?.correct ?? false
        }))
      })
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const submitEarly = () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài ngay? Các câu chưa làm sẽ bị tính là sai.')) return;
    let currentAnswers = answers;
    if (!revealed) {
      currentAnswers = [...answers, { selected: null, correct: false }];
    }

    localStorage.removeItem(`quiz_progress_${user.id}_${category}_${questionCount}`)
    const correct = currentAnswers.filter(a => a.correct).length
    onFinish({
      total: questions.length,
      correct,
      score: Math.round(correct / questions.length * 100),
      details: questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        selected: currentAnswers[i]?.selected ?? null,
        correct: currentAnswers[i]?.correct ?? false
      }))
    })
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
            <button className="btn btn-primary btn-sm" onClick={submitEarly}>📤 Nộp bài sớm</button>
            <button className="btn btn-outline btn-sm" onClick={onCancel}>✕ Thoát</button>
          </div>
        </div>

        {/* Progress */}
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: pct + '%' }} />
        </div>

        {/* Question card */}
        <div className="card">
          <div className="flex gap8 mb16" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex gap8">
              <span className="badge badge-purple">{q.category}</span>
              <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'}`}>
                {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </span>
            </div>
            <button 
              className={`btn btn-sm ${bookmarks.includes(idx) ? 'btn-primary' : 'btn-outline'}`}
              onClick={toggleBookmark}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {bookmarks.includes(idx) ? 'Đã đánh dấu' : 'Đánh dấu'}
            </button>
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
                {revealed && i === q.answer && <span style={{ marginLeft: 'auto' }}>✓</span>}
                {revealed && i === selected && i !== q.answer && <span style={{ marginLeft: 'auto' }}>✗</span>}
              </button>
            )
          })}

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <button className={`btn ${revealed ? 'btn-primary' : 'btn-outline'}`} onClick={next}>
              {idx + 1 >= questions.length 
                ? (revealed ? '🏆 Xem kết quả' : 'Nộp bài (bỏ qua câu này)') 
                : (revealed ? 'Câu tiếp theo →' : 'Bỏ qua câu này →' )}
            </button>
          </div>
        </div>

        {/* Dot progress */}
        <div className="flex gap4 mt16" style={{ flexWrap: 'wrap' }}>
          {questions.map((_, i) => {
            const cls = i < answers.length
              ? answers[i].correct ? 'done-correct' : 'done-wrong'
              : i === idx ? 'current' : ''
            const isBookmarked = bookmarks.includes(i)
            return (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: isBookmarked ? '3px' : '50%',
                background: cls === 'done-correct' ? 'var(--success)'
                  : cls === 'done-wrong' ? 'var(--danger)'
                    : cls === 'current' ? 'var(--accent)'
                      : 'var(--surface3)',
                border: isBookmarked ? '2px solid var(--accent)' : 'none',
                transition: 'all .3s'
              }} title={`Câu ${i + 1}${isBookmarked ? ' (Đã đánh dấu)' : ''}`} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
