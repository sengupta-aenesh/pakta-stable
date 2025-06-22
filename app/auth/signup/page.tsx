'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'
import { Button, Input, Label, Alert, useToast, Toast } from '@/components/ui'
import Link from 'next/link'
import styles from './signup.module.css'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast, toasts, removeToast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError('')

    const result = await signUp(email, password)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      toast('Account created! Check your email.', 'success')
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon" style={{ backgroundColor: '#F0FDF4' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
              Check your email
            </h1>
            <p className="text-secondary text-sm">
              We've sent a confirmation link to {email}
            </p>
          </div>
          
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '8px' }}>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
              Please check your email and click the confirmation link to activate your account. 
              The link will expire in 24 hours.
            </p>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <Button 
              onClick={() => router.push('/auth/login')} 
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Contract Manager" className={styles.logo} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            Create an account
          </h1>
          <p className="text-secondary text-sm">
            Start managing your contracts with AI-powered insights
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
            <p className="text-xs text-secondary" style={{ marginTop: '4px' }}>
              Must be at least 6 characters
            </p>
          </div>
          
          <div className="form-group">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="form-footer">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" style={{ fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Render toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}