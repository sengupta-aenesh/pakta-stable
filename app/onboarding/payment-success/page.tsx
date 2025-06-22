'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Check, CreditCard, Calendar } from 'lucide-react'
import styles from '../onboarding.module.css'

function PaymentSuccessContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trialInfo, setTrialInfo] = useState<{
    trialEndDate: string
    paymentMethod: string
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    handlePaymentSuccess()
  }, [])

  const handlePaymentSuccess = async () => {
    try {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        throw new Error('No session ID found')
      }

      // Verify the setup session and create subscription with trial
      const response = await fetch('/api/subscription/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to complete setup')
      }

      const data = await response.json()
      setTrialInfo({
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        paymentMethod: data.paymentMethod || 'Card ending in ****'
      })
      
      setLoading(false)
    } catch (err) {
      console.error('Payment setup error:', err)
      setError('Failed to complete payment setup. Please try again.')
      setLoading(false)
    }
  }

  const continueToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className={styles.onboardingContainer}>
        <div className={styles.stepContent}>
          <div className={styles.stepContainer}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <h3>Setting up your trial...</h3>
              <p>Please wait while we configure your account</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.onboardingContainer}>
        <div className={styles.stepContent}>
          <div className={styles.stepContainer}>
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
            <Button onClick={() => router.push('/onboarding?step=payment')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.stepContent}>
        <div className={styles.stepContainer}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className={styles.heroTitle}>
              🎉 You're all set!
            </h1>
            <p className={styles.heroSubtitle}>
              Your 7-day free trial has started. Welcome to Contract Manager Pro!
            </p>
          </div>

          <div className={styles.trialSummary}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3>Trial Details</h3>
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryRow}>
                  <span>Trial Period:</span>
                  <span><strong>7 days (FREE)</strong></span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Trial Ends:</span>
                  <span><strong>{trialInfo?.trialEndDate}</strong></span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Then:</span>
                  <span><strong>$100/month</strong></span>
                </div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <CreditCard className="w-6 h-6 text-green-600" />
                <h3>Payment Method</h3>
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryRow}>
                  <span>Method:</span>
                  <span><strong>{trialInfo?.paymentMethod}</strong></span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Status:</span>
                  <span><strong>✅ Verified</strong></span>
                </div>
                <div className={styles.summaryRow}>
                  <span>First Charge:</span>
                  <span><strong>{trialInfo?.trialEndDate}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h3>What's Next?</h3>
            <ul className={styles.nextStepsList}>
              <li>✅ Upload your first contract for instant AI analysis</li>
              <li>✅ Explore risk detection and smart insights</li>
              <li>✅ Try our PDF and Word export features</li>
              <li>✅ Organize contracts in folders</li>
            </ul>
          </div>

          <Button 
            onClick={continueToDashboard}
            size="lg"
            className={styles.primaryButton}
          >
            Start Analyzing Contracts
          </Button>

          <div className={styles.supportNote}>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:support@contractmanager.com" className={styles.supportLink}>
                support@contractmanager.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.onboardingContainer}>
        <div className={styles.stepContent}>
          <div className={styles.stepContainer}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <h3>Loading...</h3>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}