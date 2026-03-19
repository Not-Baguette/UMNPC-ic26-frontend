import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  onFallback?: () => void
}

/**
 * ProtectedRoute middleware component
 * Renders children only if user is authenticated
 * Calls onFallback (typically setViewMode('login')) if not authenticated
 */
export function ProtectedRoute({ children, onFallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading-panel" style={{ padding: '2rem' }}>Loading authentication...</div>
  }

  if (!isAuthenticated) {
    onFallback?.()
    return null
  }

  return children
}
