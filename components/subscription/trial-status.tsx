'use client'

import { useState, useEffect } from 'react'
import { Calendar, CreditCard } from 'lucide-react'
import styles from './trial-status.module.css'

interface TrialStatusProps {
  compact?: boolean
}

export default function TrialStatus({ compact = false }: TrialStatusProps) {
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number
    isInTrial: boolean
    tier: string
    trialEndDate: string
  } | null>(null)

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
          tier: data.tier || 'free',
          trialEndDate: new Date(Date.now() + (data.trialDaysRemaining || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()
        })
      }
    } catch (error) {
      console.error('Error fetching trial info:', error)
    }
  }

  if (!trialInfo?.isInTrial) {
    return null
  }

  if (compact) {
    return (
      <div className={styles.compactStatus}>
        <Calendar className="w-4 h-4" />
        <span>
          {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left in trial
        </span>
      </div>
    )
  }

  return (
    <div className={styles.trialStatusContainer}>
      <div className={styles.trialStatus}>
        <div className={styles.statusHeader}>
          <div className={styles.iconContainer}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className={styles.statusText}>
            <h4 className={styles.statusTitle}>Free Trial Active</h4>
            <p className={styles.statusSubtitle}>
              {trialInfo.daysRemaining} days remaining • Auto-converts to Pro on {trialInfo.trialEndDate}
            </p>
          </div>
        </div>
        
        <div className={styles.trialProgress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${((7 - trialInfo.daysRemaining) / 7) * 100}%` }}
            ></div>
          </div>
          <div className={styles.progressLabel}>
            Day {7 - trialInfo.daysRemaining + 1} of 7
          </div>
        </div>
      </div>
    </div>
  )
}