'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button, Input, Label, Alert } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const notifications = useEnhancedNotifications()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(email, password)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      notifications.success('Success', 'Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/folders')
        router.refresh()
      }, 1000)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Contract Manager" className={styles.logo} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            Welcome back
          </h1>
          <p className="text-secondary text-sm">
            Sign in to your contract management account
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <Alert variant="error" style={{ marginBottom: '16px' }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="form-footer">
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#F8FAFC', 
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '16px'
          }}>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.5' }}>
              <strong>Invitation available after platform demo only.</strong><br />
              Schedule a demo to get access to the platform.
            </p>
            <a 
              href="https://pakta.zohobookings.in/#/300016000000042052" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#0369A1',
                textDecoration: 'underline',
                marginTop: '4px',
                display: 'inline-block'
              }}
            >
              Schedule a demo
            </a>
          </div>
        </div>
      </div>
      
      {/* Render toasts */}
      {/* Toasts are now handled by the notification system */}
    </div>
  )
}