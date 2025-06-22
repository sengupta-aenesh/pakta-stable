'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { X, Check, Zap, Shield, Brain, CreditCard } from 'lucide-react'
import styles from './upgrade-modal.module.css'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'trial-ending' | 'feature-limit' | 'value-demonstration'
  daysRemaining?: number
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  trigger = 'trial-ending',
  daysRemaining = 0 
}: UpgradeModalProps) {
  const [upgrading, setUpgrading] = useState(false)

  if (!isOpen) return null

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

  const getModalContent = () => {
    switch (trigger) {
      case 'trial-ending':
        return {
          icon: <Zap className="w-8 h-8" />,
          title: daysRemaining <= 1 ? 'Trial expires today!' : `${daysRemaining} days left in trial`,
          subtitle: 'Continue enjoying all Pro features for just $100/month',
          urgency: daysRemaining <= 2
        }
      
      case 'feature-limit':
        return {
          icon: <Shield className="w-8 h-8" />,
          title: 'Unlock unlimited access',
          subtitle: 'Upgrade to Pro and remove all limits on your contract analysis',
          urgency: false
        }
      
      case 'value-demonstration':
        return {
          icon: <Brain className="w-8 h-8" />,
          title: 'Love what you see?',
          subtitle: 'Join thousands of professionals who trust Contract Manager Pro',
          urgency: false
        }
      
      default:
        return {
          icon: <Zap className="w-8 h-8" />,
          title: 'Upgrade to Pro',
          subtitle: 'Get unlimited access to all features',
          urgency: false
        }
    }
  }

  const content = getModalContent()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${content.urgency ? styles.urgent : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        
        <div className={styles.header}>
          <div className={`${styles.iconContainer} ${content.urgency ? styles.urgentIcon : ''}`}>
            {content.icon}
          </div>
          <h2 className={styles.title}>{content.title}</h2>
          <p className={styles.subtitle}>{content.subtitle}</p>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>Unlimited contract analysis</span>
            </div>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>Advanced AI risk detection</span>
            </div>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>PDF & Word export</span>
            </div>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>Priority support</span>
            </div>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>Team collaboration</span>
            </div>
            <div className={styles.feature}>
              <Check className="w-5 h-5 text-green-600" />
              <span>API access</span>
            </div>
          </div>
        </div>
        
        <div className={styles.pricing}>
          <div className={styles.priceContainer}>
            <div className={styles.price}>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>100</span>
              <span className={styles.period}>/month</span>
            </div>
            <div className={styles.priceNote}>
              Cancel anytime • 30-day money-back guarantee
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button
            onClick={handleUpgrade}
            loading={upgrading}
            size="lg"
            className={styles.upgradeButton}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {upgrading ? 'Setting up...' : 'Upgrade to Pro'}
          </Button>
          
          <button 
            onClick={onClose}
            className={styles.laterButton}
          >
            {trigger === 'trial-ending' && daysRemaining <= 1 ? 'Remind me in 1 hour' : 'Maybe later'}
          </button>
        </div>
        
        {content.urgency && (
          <div className={styles.urgencyNote}>
            ⚡ Don't lose access to your analyzed contracts!
          </div>
        )}
      </div>
    </div>
  )
}