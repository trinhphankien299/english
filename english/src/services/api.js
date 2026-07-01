import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

/* ══ AUTH ══ */
export const authAPI = {
  login: async (email, password) => {
    const { data } = await http.get(`/users?email=${email}&password=${password}`)
    if (!data.length) throw new Error('Email hoặc mật khẩu không đúng')
    const { password: _pw, ...user } = data[0]
    return user
  },

  register: async ({ name, email, password }) => {
    const { data: existing } = await http.get(`/users?email=${email}`)
    if (existing.length) throw new Error('Email đã được sử dụng')
    const newUser = {
      id: `u_${Date.now()}`,
      name, email, password,
      role: 'user',
      createdAt: new Date().toISOString()
    }
    await http.post('/users', newUser)
    const { password: _pw, ...safe } = newUser
    return safe
  }
}

/* ══ QUESTIONS ══ */
export const questionAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`/questions${qs ? '?' + qs : ''}`).then(r => r.data)
  },
  create: (data) => http.post('/questions', {
    ...data,
    id: `q_${Date.now()}`,
    createdAt: new Date().toISOString()
  }).then(r => r.data),
  update: (id, data) => http.put(`/questions/${id}`, data).then(r => r.data),
  delete: (id)       => http.delete(`/questions/${id}`).then(r => r.data)
}

/* ══ USERS ══ */
export const userAPI = {
  getAll: () => http.get('/users').then(r =>
    r.data
      .filter(u => u.role !== 'admin')
      .map(({ password, ...u }) => u)
  ),
  delete: (id) => http.delete(`/users/${id}`).then(r => r.data)
}

/* ══ HISTORY ══ */
export const historyAPI = {
  getAll:     ()       => http.get('/history?_sort=date&_order=desc').then(r => r.data),
  getByUser:  (userId) => http.get(`/history?userId=${userId}&_sort=date&_order=desc`).then(r => r.data),
  create:     (data)   => http.post('/history', {
    ...data,
    id:   `h_${Date.now()}`,
    date: new Date().toISOString()
  }).then(r => r.data)
}

export default http
