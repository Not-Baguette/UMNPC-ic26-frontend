import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type AuthStep = 'login' | 'register' | 'register-complete'

interface LoginViewProps {
  onSuccess?: () => void
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const { login, register } = useAuth()
  const [step, setStep] = useState<AuthStep>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Login form fields
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form fields
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regFullName, setRegFullName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!loginUsername.trim()) {
        throw new Error('Username is required')
      }
      if (!loginPassword) {
        throw new Error('Password is required')
      }

      await login(loginUsername, loginPassword)
      setFeedback('Login successful!')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!regUsername.trim()) {
        throw new Error('Username is required')
      }
      if (!regFullName.trim()) {
        throw new Error('Full name is required')
      }
      if (!regPassword) {
        throw new Error('Password is required')
      }
      if (regPassword !== regPasswordConfirm) {
        throw new Error('Passwords do not match')
      }
      if (regPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      await register({
        username: regUsername,
        password: regPassword,
        fullname: regFullName,
      })

      setFeedback('Registration successful! Welcome to the contest.')
      setStep('register-complete')
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <section className="auth-container" style={{ width: '100%', maxWidth: '400px' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>DOMjudge Contest Arena</h1>
          <p style={{ color: '#666', margin: 0 }}>
            {step === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </header>

        {error && (
          <div
            style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {feedback && (
          <div
            style={{
              backgroundColor: '#efe',
              color: '#3c3',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {feedback}
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="login-username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('register')
                  setError(null)
                  setFeedback(null)
                }}
                style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="reg-fullname" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Full Name
              </label>
              <input
                id="reg-fullname"
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="reg-username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="reg-password-confirm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Confirm Password
              </label>
              <input
                id="reg-password-confirm"
                type="password"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('login')
                  setError(null)
                  setFeedback(null)
                }}
                style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {step === 'register-complete' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ margin: '0 0 1rem 0' }}>Welcome!</h2>
            <p style={{ color: '#666' }}>Your account has been created successfully. Redirecting you to the contest...</p>
          </div>
        )}
      </section>
    </main>
  )
}
