'use client'

import React from 'react'
import styles from './upload-flow-status.module.css'

interface UploadStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'active' | 'complete' | 'error'
}

interface UploadFlowStatusProps {
  currentStep: string
  progress: number
  error?: string
  steps?: UploadStep[]
}

const DEFAULT_STEPS: UploadStep[] = [
  {
    id: 'extract',
    label: 'Extract Text',
    description: 'Reading document content...',
    status: 'pending'
  },
  {
    id: 'save',
    label: 'Save Contract',
    description: 'Storing in database...',
    status: 'pending'
  },
  {
    id: 'analyze',
    label: 'AI Analysis',
    description: 'Analyzing contract terms...',
    status: 'pending'
  }
]

export function UploadFlowStatus({ 
  currentStep, 
  progress = 0, 
  error,
  steps = DEFAULT_STEPS 
}: UploadFlowStatusProps) {
  const getStepStatus = (step: UploadStep): UploadStep['status'] => {
    if (error && step.id === currentStep) return 'error'
    
    const stepIndex = steps.findIndex(s => s.id === step.id)
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    
    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStepIcon = (status: UploadStep['status']) => {
    switch (status) {
      case 'complete':
        return (
          <svg className={styles.stepIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'active':
        return (
          <div className={styles.spinner}>
            <div className={styles.spinnerInner}></div>
          </div>
        )
      case 'error':
        return (
          <svg className={styles.stepIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <div className={styles.stepNumber}>
            {steps.findIndex(s => s.id === currentStep) + 1}
          </div>
        )
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {error ? 'Upload Failed' : 'Processing Document'}
        </h3>
        {!error && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}
      </div>

      <div className={styles.steps}>
        {steps.map((step, index) => {
          const status = getStepStatus(step)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className={styles.stepContainer}>
              <div className={`${styles.step} ${styles[status]}`}>
                <div className={styles.stepIconContainer}>
                  {getStepIcon(status)}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepDescription}>
                    {status === 'active' ? step.description : 
                     status === 'complete' ? 'Complete' :
                     status === 'error' ? 'Failed' : 'Waiting...'}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div className={`${styles.connector} ${
                  status === 'complete' ? styles.connectorComplete : ''
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorContent}>
            <div className={styles.errorTitle}>Upload Failed</div>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadFlowStatus