import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type AuthUser = {
  id: string
  username: string
  fullname?: string
  team_id?: string
  role?: string
}

type AuthContextType = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'domjudge-auth-v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        const userData = JSON.parse(saved) as AuthUser
        setUser(userData)
      }
    } catch {
      // Ignore parsing errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveUser = (userData: AuthUser | null) => {
    setUser(userData)
    if (userData) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const login = async (username: string, password: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions
    password
    // Mock login - in a real app, this would call your backend
    // For now, we'll create a basic user object
    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      username,
      fullname: username,
    }
    saveUser(newUser)
  }

  const logout = () => {
    saveUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
