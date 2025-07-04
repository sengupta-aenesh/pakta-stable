'use client'

import React from 'react'
import styles from './contract-status-badge.module.css'

export type ContractStatus = 'uploading' | 'pending' | 'in_progress' | 'complete' | 'failed' | null

interface ContractStatusBadgeProps {
  status: ContractStatus
  progress?: number
  size?: 'small' | 'medium'
  showText?: boolean
}

export function ContractStatusBadge({ 
  status, 
  progress = 0, 
  size = 'small', 
  showText = false 
}: ContractStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: '⬆️',
          text: 'Uploading',
          className: styles.uploading,
          showProgress: true
        }
      case 'pending':
        return {
          icon: '⏳',
          text: 'Pending Analysis',
          className: styles.pending,
          showProgress: false
        }
      case 'in_progress':
        return {
          icon: '🔄',
          text: 'Analyzing',
          className: styles.analyzing,
          showProgress: true
        }
      case 'complete':
        return {
          icon: '✅',
          text: 'Complete',
          className: styles.complete,
          showProgress: false
        }
      case 'failed':
        return {
          icon: '❌',
          text: 'Failed',
          className: styles.failed,
          showProgress: false
        }
      default:
        return {
          icon: '📄',
          text: 'Ready',
          className: styles.ready,
          showProgress: false
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`${styles.badge} ${styles[size]} ${config.className}`}>
      <span className={styles.icon}>{config.icon}</span>
      {showText && (
        <span className={styles.text}>{config.text}</span>
      )}
      {config.showProgress && progress > 0 && (
        <div className={styles.progressRing}>
          <svg className={styles.progressSvg} viewBox="0 0 24 24">
            <circle
              className={styles.progressBackground}
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
              fill="none"
            />
            <circle
              className={styles.progressForeground}
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${progress * 0.628} 62.8`}
              transform="rotate(-90 12 12)"
            />
          </svg>
          <span className={styles.progressText}>{progress}%</span>
        </div>
      )}
    </div>
  )
}

export default ContractStatusBadge