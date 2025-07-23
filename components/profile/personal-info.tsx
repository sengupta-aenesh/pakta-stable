'use client'

import { useState } from 'react'
import { AuthUser } from '@/lib/auth-client'
import { UserProfile } from '@/lib/services/subscription'
import { Button } from '@/components/ui'
import styles from './profile-components.module.css'

interface PersonalInfoProps {
  user: AuthUser
  profile: UserProfile | null
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>
  saving: boolean
}

export default function PersonalInfo({ user, profile, onUpdate, saving }: PersonalInfoProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Personal Information</h2>
      <p className={styles.sectionDescription}>
        View your account details
      </p>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            className={styles.inputDisabled}
          />
          <p className={styles.helperText}>
            Your account email address
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Account Created</label>
          <input
            type="text"
            value={new Date(user.created_at).toLocaleDateString()}
            disabled
            className={styles.inputDisabled}
          />
          <p className={styles.helperText}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Subscription Status</label>
          <input
            type="text"
            value={`${profile?.subscription_tier || 'Pro'} - ${profile?.subscription_status || 'Active'}`}
            disabled
            className={styles.inputDisabled}
          />
        </div>
      </div>
    </div>
  )
}