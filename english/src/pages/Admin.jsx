import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import QuestionCard from '../Components/QuestionCard'
import { questionAPI, userAPI, historyAPI } from '../services/api'

const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }
const DIFF_CLASS  = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' }

export default function Admin({ notify }) {
  const [tab, setTab] = useState('questions') // questions | users

  return (
    <div className="page-wrapper">
      <Header title="Quản trị hệ thống ⚙️" subtitle="Quản lý câu hỏi và người dùng" />

      {/* Tab switcher */}
      <div className="tabs" style={{ maxWidth: 320, marginBottom: 24 }}>
        <button className={`tab-btn ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')}>
          📝 Câu hỏi
        </button>
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          👥 Người dùng
        </button>
      </div>

      {tab === 'questions' ? (
        <QuestionsTab notify={notify} />
      ) : (
        <UsersTab notify={notify} />
      )}
    </div>
  )
}

/* ════════════════ QUESTIONS TAB ════════════════ */
function QuestionsTab({ notify }) {
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [diffFilter,setDiff]      = useState('all')
  const [modal,     setModal]     = useState(null) // {mode, question?}
  const [deleting,  setDeleting]  = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)

  const fetchAll = async () => {
    setLoading(true)
    try { setQuestions(await questionAPI.getAll()) }
    catch { notify('Không thể tải câu hỏi', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  // EXAMS LOGIC
  const exams = Array.from(new Set(questions.map(q => q.category))).sort()
  const examStats = exams.map(ex => ({
    name: ex,
    count: questions.filter(q => q.category === ex).length
  }))
  const filteredExams = examStats.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  // EXAM DETAILS LOGIC
  const examQuestions = questions.filter(q => q.category === selectedExam)
  const filteredQs = examQuestions.filter(q => {
    const matchS = q.question.toLowerCase().includes(search.toLowerCase())
    const matchD = diffFilter === 'all' || q.difficulty === diffFilter
    return matchS && matchD
  })

  const handleSave = async (formData) => {
    try {
      if (modal.mode === 'add') {
        const created = await questionAPI.create(formData)
        setQuestions(prev => [...prev, created])
        notify('✅ Đã thêm câu hỏi mới')
      } else {
        const updated = await questionAPI.update(formData.id, formData)
        setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q))
        notify('✅ Đã cập nhật câu hỏi')
      }
      setModal(null)
    } catch { notify('Lỗi khi lưu câu hỏi', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return
    setDeleting(id)
    try {
      await questionAPI.delete(id)
      setQuestions(prev => prev.filter(q => q.id !== id))
      notify('🗑️ Đã xóa câu hỏi')
    } catch { notify('Lỗi khi xóa', 'error') }
    finally { setDeleting(null) }
  }

  return (
    <>
      {!selectedExam ? (
        // --- VIEW 1: EXAM LIST ---
        <>
          <div className="header-row" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{exams.length} đề thi</div>
              <div className="text-sm text-muted">Quản lý các đề thi trong hệ thống</div>
            </div>
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
              ➕ Tạo câu hỏi / Đề mới
            </button>
          </div>

          <div className="card">
            <div className="search-row">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm tên đề thi..." />
            </div>

            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : (
              <div className="grid4">
                {filteredExams.map(ex => (
                  <div key={ex.name} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 20 }} 
                       onClick={() => { setSelectedExam(ex.name); setSearch(''); }}>
                    <div className="stat-icon" style={{ background: 'rgba(108,99,255,.18)' }}>📝</div>
                    <div>
                      <div className="stat-val" style={{ fontSize: 18 }}>{ex.name}</div>
                      <div className="stat-lbl">{ex.count} câu hỏi</div>
                    </div>
                  </div>
                ))}
                {filteredExams.length === 0 && (
                   <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                     <div className="empty-icon">📭</div>
                     <h3>Không tìm thấy đề thi</h3>
                   </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        // --- VIEW 2: QUESTION LIST ---
        <>
          <div className="header-row" style={{ marginBottom: 16 }}>
            <div className="flex items-c gap12">
              <button className="btn btn-outline btn-sm" onClick={() => { setSelectedExam(null); setSearch(''); setDiff('all'); }}>
                ⬅ Quay lại
              </button>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Chi tiết: {selectedExam}</div>
                <div className="text-sm text-muted">{examQuestions.length} câu hỏi</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
              ➕ Thêm câu hỏi vào đề này
            </button>
          </div>

          <div className="card">
            <div className="search-row">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm câu hỏi..." />
              <select value={diffFilter} onChange={e => setDiff(e.target.value)}>
                <option value="all">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Câu hỏi</th><th>Độ khó</th><th>Đáp án đúng</th><th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQs.length === 0 && (
                    <tr><td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Không tìm thấy câu hỏi</h3>
                      </div>
                    </td></tr>
                  )}
                  {filteredQs.map((q, i) => (
                    <tr key={q.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td style={{ maxWidth: 340, color: 'var(--text)' }}>{q.question}</td>
                      <td><span className={`badge ${DIFF_CLASS[q.difficulty]}`}>{DIFF_LABEL[q.difficulty]}</span></td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                        {String.fromCharCode(65 + q.answer)}. {q.options?.[q.answer]}
                      </td>
                      <td>
                        <div className="flex gap8">
                          <button className="btn btn-outline btn-sm"
                            onClick={() => setModal({ mode: 'edit', question: q })}>
                            ✏️ Sửa
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}>
                            {deleting === q.id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modal && (
        <QuestionCard
          mode={modal.mode}
          question={modal.question}
          exams={exams}
          defaultExam={selectedExam || 'Đề 1'}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

/* ════════════════ USERS TAB ════════════════ */
function UsersTab({ notify }) {
  const [users,    setUsers]   = useState([])
  const [history,  setHistory] = useState([])
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState('')
  const [deleting, setDel]     = useState(null)

  useEffect(() => {
    Promise.all([userAPI.getAll(), historyAPI.getAll()])
      .then(([us, hist]) => { setUsers(us); setHistory(hist) })
      .catch(() => notify('Không thể tải dữ liệu', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const userStats = (uid) => {
    const h   = history.filter(x => x.userId === uid)
    const avg = h.length ? Math.round(h.reduce((a, x) => a + x.score, 0) / h.length) : null
    return { count: h.length, avg }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa người dùng này?')) return
    setDel(id)
    try {
      await userAPI.delete(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      notify('🗑️ Đã xóa người dùng')
    } catch { notify('Lỗi khi xóa', 'error') }
    finally { setDel(null) }
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{users.length} tài khoản</div>
        <div className="text-sm text-muted">Quản lý người dùng đã đăng ký</div>
      </div>

      <div className="card">
        <div className="search-row">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm tên, email..." />
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Họ tên</th><th>Email</th><th>Lượt thi</th><th>Điểm TB</th><th>Ngày tạo</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">👤</div>
                      <h3>Không tìm thấy người dùng</h3>
                    </div>
                  </td></tr>
                )}
                {filtered.map((u, i) => {
                  const s = userStats(u.id)
                  return (
                    <tr key={u.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge badge-cyan">{s.count}</span></td>
                      <td>
                        {s.avg !== null
                          ? <span className={`badge ${s.avg >= 60 ? 'badge-green' : 'badge-red'}`}>{s.avg}%</span>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td className="text-muted text-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}>
                          {deleting === u.id ? '...' : '🗑️ Xóa'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
