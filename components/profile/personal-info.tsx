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
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = async () => {
    await onUpdate({
      // Note: These fields would need to be added to the profiles table
      // For now, we'll show the form but note that saving requires DB schema update
    })
    setHasChanges(false)
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Personal Information</h2>
      <p className={styles.sectionDescription}>
        Update your personal details and contact information
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
            Email cannot be changed
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setHasChanges(true)
            }}
            placeholder="Enter your full name"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Role / Title</label>
          <input
            type="text"
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setHasChanges(true)
            }}
            placeholder="e.g., Legal Counsel, Contract Manager"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Account Created</label>
          <input
            type="text"
            value={new Date(user.created_at).toLocaleDateString()}
            disabled
            className={styles.inputDisabled}
          />
        </div>
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <Button
            onClick={handleSave}
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      <div className={styles.note}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p>Note: Personal name and role fields require database schema updates to persist.</p>
      </div>
    </div>
  )
}