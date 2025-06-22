'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Clock, Zap, CreditCard, X } from 'lucide-react'
// Stripe removed - payment functionality disabled
import styles from './trial-banner.module.css'

interface TrialBannerProps {
  onUpgrade?: () => void
  onDismiss?: () => void
  compact?: boolean
}

export default function TrialBanner({ onUpgrade, onDismiss, compact = false }: TrialBannerProps) {
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number
    isInTrial: boolean
    tier: string
  } | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTrialInfo()
  }, [])

  const fetchTrialInfo = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setTrialInfo({
          daysRemaining: data.trialDaysRemaining || 0,
          isInTrial: data.isInTrial || false,
          tier: data.tier || 'free'
        })
      }
    } catch (error) {
      console.error('Error fetching trial info:', error)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tierName: 'pro', 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID 
        }),
      })

      if (!response.ok) throw new Error('Failed to create checkout session')

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      setUpgrading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (!trialInfo?.isInTrial || dismissed) {
    return null
  }

  const urgencyLevel = trialInfo.daysRemaining <= 2 ? 'urgent' : 
                      trialInfo.daysRemaining <= 4 ? 'warning' : 'normal'

  if (compact) {
    return (
      <div className={`${styles.compactBanner} ${styles[urgencyLevel]}`}>
        <div className={styles.compactContent}>
          <Clock className="w-4 h-4" />
          <span>
            {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left in trial
          </span>
        </div>
        <Button
          onClick={handleUpgrade}
          size="sm"
          loading={upgrading}
          className={styles.compactButton}
        >
          Upgrade Now
        </Button>
      </div>
    )
  }

  return (
    <div className={`${styles.trialBanner} ${styles[urgencyLevel]}`}>
      <div className={styles.bannerContent}>
        <div className={styles.iconSection}>
          <div className={styles.iconContainer}>
            {urgencyLevel === 'urgent' ? (
              <Zap className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>
        </div>
        
        <div className={styles.textSection}>
          <h3 className={styles.title}>
            {urgencyLevel === 'urgent' ? (
              'Trial expires soon!'
            ) : urgencyLevel === 'warning' ? (
              'Trial ending soon'
            ) : (
              'Free trial active'
            )}
          </h3>
          <p className={styles.subtitle}>
            {trialInfo.daysRemaining === 1 ? (
              'Your trial expires tomorrow. Upgrade now to continue using all features.'
            ) : trialInfo.daysRemaining === 0 ? (
              'Your trial expires today! Upgrade now to maintain access.'
            ) : (
              `${trialInfo.daysRemaining} days remaining in your free trial. Upgrade to Pro for just $100/month.`
            )}
          </p>
        </div>
        
        <div className={styles.actionSection}>
          <Button
            onClick={handleUpgrade}
            loading={upgrading}
            className={styles.upgradeButton}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {upgrading ? 'Processing...' : 'Upgrade to Pro'}
          </Button>
        </div>
        
        {urgencyLevel === 'normal' && (
          <button 
            onClick={handleDismiss}
            className={styles.dismissButton}
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}