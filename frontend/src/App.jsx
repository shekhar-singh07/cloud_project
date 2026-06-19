import { useState, useEffect } from 'react'
import './App.css'

// const API_URL = 'http://localhost:8000/api'
const API_URL = 'http://34.100.180.130:8000/api'

function App() {
  // Auth state
  // const [token, setToken] = useState(localStorage.getItem('token') || '')
  // const [token, setToken] = useState("guest")
  const [token] = useState(true)
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [isLogin, setIsLogin] = useState(true)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Notes state
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auth headers helper
const authHeaders = () => ({
  'Content-Type': 'application/json',
})

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!authUsername.trim() || !authPassword.trim()) return
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch(`${API_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername.trim(), password: authPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        const errMsg = data.username?.[0] || data.password?.[0] || data.error || 'Signup failed.'
        throw new Error(errMsg)
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      setToken(data.token)
      setUsername(data.user.username)
      setAuthUsername('')
      setAuthPassword('')
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!authUsername.trim() || !authPassword.trim()) return
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername.trim(), password: authPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      setToken(data.token)
      setUsername(data.user.username)
      setAuthUsername('')
      setAuthPassword('')
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken('')
    setUsername('')
    setNotes([])
    setSearchQuery('')
    setNewNote('')
    setError('')
  }

  // Fetch notes
  const fetchNotes = async () => {
    //auth disabled for testing
    try {
      setIsLoading(true)
      const url = searchQuery
        ? `${API_URL}/notes/?search=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/notes/`
      const response = await fetch(url, { headers: authHeaders() })

      if (response.status === 401) {
        handleLogout()
        return
      }
      if (!response.ok) throw new Error('Failed to fetch notes')

      const data = await response.json()
      setNotes(data)
      setError('')
    } catch (err) {
      setError('Could not connect to the server. Make sure Django is running on port 8000.')
    } finally {
      setIsLoading(false)
    }
  }

  // Add note
  const addNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const response = await fetch(`${API_URL}/notes/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: newNote.trim() }),
      })

      if (response.status === 401) {
        handleLogout()
        return
      }
      if (!response.ok) throw new Error('Failed to add note')

      const data = await response.json()
      setNotes((prev) => [data, ...prev])
      setNewNote('')
      setError('')
    } catch (err) {
      setError('Failed to add note. Check your connection.')
    }
  }

  // Delete note
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}/`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (response.status === 401) {
        handleLogout()
        return
      }
      if (!response.ok) throw new Error('Failed to delete note')

      setNotes((prev) => prev.filter((note) => note.id !== id))
      setError('')
    } catch (err) {
      setError('Failed to delete note.')
    }
  }

  // Fetch notes on mount and when search changes
useEffect(() => {
  const debounce = setTimeout(() => {
    fetchNotes()
  }, 300)

  return () => clearTimeout(debounce)
}, [searchQuery])

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ─── AUTH SCREEN ────────────────────────────
//   if (!token) {
//   setToken("guest")
// }
//     return (
//       <div className="app">
//         <div className="bg-orb bg-orb-1"></div>
//         <div className="bg-orb bg-orb-2"></div>
//         <div className="bg-orb bg-orb-3"></div>

//         <div className="auth-container">
//           <div className="auth-card">
//             {/* Logo */}
//             <div className="auth-header">
//               <div className="header-icon">
//                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//                   <polyline points="14,2 14,8 20,8" />
//                   <line x1="16" y1="13" x2="8" y2="13" />
//                   <line x1="16" y1="17" x2="8" y2="17" />
//                 </svg>
//               </div>
//               <h1 className="auth-title">CloudNotes</h1>
//               <p className="auth-subtitle">
//                 {isLogin ? 'Welcome back! Sign in to your account.' : 'Create an account to get started.'}
//               </p>
//             </div>

//             {/* Tab Switcher */}
//             <div className="auth-tabs">
//               <button
//                 className={`auth-tab ${isLogin ? 'active' : ''}`}
//                 onClick={() => { setIsLogin(true); setAuthError('') }}
//               >
//                 Login
//               </button>
//               <button
//                 className={`auth-tab ${!isLogin ? 'active' : ''}`}
//                 onClick={() => { setIsLogin(false); setAuthError('') }}
//               >
//                 Sign Up
//               </button>
//             </div>

//             {/* Auth Form */}
//             <form className="auth-form" onSubmit={isLogin ? handleLogin : handleSignup}>
//               <div className="form-group">
//                 <label className="form-label" htmlFor="auth-username">Username</label>
//                 <div className="input-wrapper">
//                   <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                     <circle cx="12" cy="7" r="4" />
//                   </svg>
//                   <input
//                     id="auth-username"
//                     type="text"
//                     className="auth-input"
//                     placeholder="Enter your username"
//                     value={authUsername}
//                     onChange={(e) => setAuthUsername(e.target.value)}
//                     autoComplete="username"
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label className="form-label" htmlFor="auth-password">Password</label>
//                 <div className="input-wrapper">
//                   <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                     <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                   </svg>
//                   <input
//                     id="auth-password"
//                     type="password"
//                     className="auth-input"
//                     placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
//                     value={authPassword}
//                     onChange={(e) => setAuthPassword(e.target.value)}
//                     autoComplete={isLogin ? 'current-password' : 'new-password'}
//                   />
//                 </div>
//               </div>

//               {authError && (
//                 <div className="auth-error">
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <circle cx="12" cy="12" r="10" />
//                     <line x1="15" y1="9" x2="9" y2="15" />
//                     <line x1="9" y1="9" x2="15" y2="15" />
//                   </svg>
//                   {authError}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="auth-submit"
//                 disabled={authLoading || !authUsername.trim() || !authPassword.trim()}
//               >
//                 {authLoading ? (
//                   <div className="loading-spinner small"></div>
//                 ) : (
//                   <>
//                     {isLogin ? 'Sign In' : 'Create Account'}
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                       <line x1="5" y1="12" x2="19" y2="12" />
//                       <polyline points="12,5 19,12 12,19" />
//                     </svg>
//                   </>
//                 )}
//               </button>
//             </form>

//             <p className="auth-footer-text">
//               {isLogin ? "Don't have an account? " : 'Already have an account? '}
//               <button className="auth-switch" onClick={() => { setIsLogin(!isLogin); setAuthError('') }}>
//                 {isLogin ? 'Sign Up' : 'Sign In'}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     )
  

  // ─── NOTES SCREEN ────────────────────────────
  return (
    <div className="app">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-row">
            <div className="header-left">
              <div className="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <h1 className="header-title">CloudNotes</h1>
                <p className="header-subtitle">
                 Welcome to CloudNotes
                </p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-wrapper">
          <div className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Add Note Form */}
        <form className="add-form" onSubmit={addNote}>
          <input
            id="note-input"
            type="text"
            className="note-input"
            placeholder="Write a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={255}
          />
          <button id="add-note-btn" type="submit" className="add-btn" disabled={!newNote.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Note
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Notes Count */}
        {notes.length > 0 && (
          <div className="notes-count">
            <span className="count-badge">{notes.length}</span>
            {searchQuery ? 'results found' : 'notes total'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading notes...</span>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && notes.length > 0 && (
          <div className="notes-grid">
            {notes.map((note, index) => (
              <div className="note-card" key={note.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="note-content">
                  <h3 className="note-title">{note.title}</h3>
                  <span className="note-timestamp">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {formatDate(note.created_at)}
                  </span>
                </div>
                <button className="delete-btn" onClick={() => deleteNote(note.id)} aria-label={`Delete note: ${note.title}`} title="Delete note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <h3 className="empty-title">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="empty-text">
              {searchQuery
                ? `No notes match "${searchQuery}". Try a different search.`
                : 'Start by adding your first note above. Your ideas deserve a home!'}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>CloudNotes — Built with Django & React</p>
        </footer>
      </div>
    </div>
  )
}

export default App
