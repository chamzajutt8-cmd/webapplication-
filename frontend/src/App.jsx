import { useState, useEffect } from 'react'

const API = 'http://localhost:5000/api'

function App() {
  const [view, setView] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      setCurrentUser(JSON.parse(saved))
      setView('users')
      fetchUsers(JSON.parse(saved).username)
    }
  }, [])

  const fetchUsers = async (uname) => {
    const res = await fetch(`${API}/users`, {
      headers: { 'X-Username': uname }
    })
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      setView('login')
      setPassword('')
    } else {
      const data = await res.json()
      setError(data.error || 'Registration failed')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('user', JSON.stringify(data))
      setCurrentUser(data)
      setView('users')
      fetchUsers(data.username)
    } else {
      const data = await res.json()
      setError(data.error || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setCurrentUser(null)
    setUsers([])
    setView('login')
    setUsername('')
    setPassword('')
  }

  if (view === 'users') {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>Welcome, {currentUser?.username}</h2>
        <button onClick={logout}>Logout</button>
        <h3>All Users</h3>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>ID</th><th>Username</th><th>Created</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 320 }}>
      <h2>{view === 'login' ? 'Login' : 'Register'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">
          {view === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
      <p>
        {view === 'login' ? (
          <button onClick={() => { setView('register'); setError('') }} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
            Need an account? Register
          </button>
        ) : (
          <button onClick={() => { setView('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
            Already have an account? Login
          </button>
        )}
      </p>
    </div>
  )
}

export default App
