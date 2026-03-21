import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface LoginViewProps {
  onSuccess?: () => void
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Login form fields
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f1] p-6">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <header className="bg-[#0736ff] py-8 px-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Internal Contest <span className="text-[#fadb5e]">Arena</span>
          </h1>
          <p className="text-blue-100 mt-2 text-sm opacity-90">
            Sign in with your provided contestant account
          </p>
        </header>

        <div className="p-8">
          {/* Alert Messaging */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {feedback && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
              {feedback}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="login-username"
                className="block text-sm font-semibold text-[#211f1f]"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                disabled={loading}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0736ff] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-[#211f1f]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0736ff] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all transform active:scale-[0.98] 
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0736ff] hover:bg-blue-700 hover:shadow-md'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Accounts are pre-assigned by the administrator. <br />
              Need help? Contact the contest supervisor.
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
