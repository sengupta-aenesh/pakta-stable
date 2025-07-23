'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/services/subscription'
import { Button } from '@/components/ui'
import styles from './profile-components.module.css'

interface CompanyDetailsProps {
  profile: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>
  saving: boolean
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Legal Services',
  'Consulting',
  'Media & Entertainment',
  'Non-profit',
  'Other'
]

const companySizes = [
  { value: 'startup', label: '1-10 employees' },
  { value: 'small', label: '11-50 employees' },
  { value: 'medium', label: '51-200 employees' },
  { value: 'large', label: '201-1000 employees' },
  { value: 'enterprise', label: '1000+ employees' },
]

export default function CompanyDetails({ profile, onUpdate, saving }: CompanyDetailsProps) {
  const [organizationType, setOrganizationType] = useState(profile.organization_type || '')
  const [industry, setIndustry] = useState(profile.industry || '')
  const [companySize, setCompanySize] = useState(profile.company_size || '')
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = async () => {
    await onUpdate({
      organization_type: organizationType,
      industry,
      company_size: companySize,
    })
    setHasChanges(false)
  }

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'organizationType':
        setOrganizationType(value)
        break
      case 'industry':
        setIndustry(value)
        break
      case 'companySize':
        setCompanySize(value)
        break
    }
    setHasChanges(true)
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Company Details</h2>
      <p className={styles.sectionDescription}>
        Help us understand your organization to provide better contract recommendations
      </p>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Organization Type</label>
          <select
            value={organizationType}
            onChange={(e) => handleFieldChange('organizationType', e.target.value)}
            className={styles.select}
          >
            <option value="">Select organization type</option>
            <option value="corporation">Corporation</option>
            <option value="llc">Limited Liability Company (LLC)</option>
            <option value="partnership">Partnership</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="non_profit">Non-Profit Organization</option>
            <option value="government">Government Agency</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Company Size</label>
          <select
            value={companySize}
            onChange={(e) => handleFieldChange('companySize', e.target.value)}
            className={styles.select}
          >
            <option value="">Select company size</option>
            {companySizes.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Industry</label>
        <div className={styles.industryGrid}>
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => handleFieldChange('industry', ind)}
              className={`${styles.industryOption} ${industry === ind ? styles.selected : ''}`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              setOrganizationType(profile.organization_type || '')
              setIndustry(profile.industry || '')
              setCompanySize(profile.company_size || '')
              setHasChanges(false)
            }}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}