'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/services/subscription'
import { Button } from '@/components/ui'
import styles from './profile-components.module.css'

interface LegalPreferencesProps {
  profile: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>
  saving: boolean
}

const contractTypes = [
  'Service Agreements',
  'Non-Disclosure Agreements (NDAs)',
  'Employment Contracts',
  'Sales Agreements',
  'Licensing Agreements',
  'Partnership Agreements',
  'Vendor Contracts',
  'Lease Agreements',
  'Consulting Agreements',
  'Software Licenses',
]

const complianceAreas = [
  'Data Protection (GDPR, CCPA)',
  'Employment Law',
  'Intellectual Property',
  'Export Controls',
  'Anti-Corruption (FCPA)',
  'Securities Regulations',
  'Healthcare Compliance (HIPAA)',
  'Financial Services Regulations',
  'Environmental Regulations',
  'Consumer Protection',
]

export default function LegalPreferences({ profile, onUpdate, saving }: LegalPreferencesProps) {
  const [riskTolerance, setRiskTolerance] = useState(profile.risk_tolerance || 'medium')
  const [hasLegalCounsel, setHasLegalCounsel] = useState(profile.has_legal_counsel || false)
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>([])
  const [selectedComplianceAreas, setSelectedComplianceAreas] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = async () => {
    await onUpdate({
      risk_tolerance: riskTolerance,
      has_legal_counsel: hasLegalCounsel,
      // Contract types and compliance areas would need to be added to legal_context JSONB field
    })
    setHasChanges(false)
  }

  const handleRiskToleranceChange = (value: string) => {
    setRiskTolerance(value)
    setHasChanges(true)
  }

  const handleContractTypeToggle = (type: string) => {
    setSelectedContractTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
    setHasChanges(true)
  }

  const handleComplianceAreaToggle = (area: string) => {
    setSelectedComplianceAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
    setHasChanges(true)
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Legal Preferences</h2>
      <p className={styles.sectionDescription}>
        Customize how we analyze contracts based on your legal requirements and risk profile
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>Risk Tolerance</label>
        <div className={styles.riskToleranceOptions}>
          <button
            onClick={() => handleRiskToleranceChange('low')}
            className={`${styles.riskOption} ${riskTolerance === 'low' ? styles.selected : ''}`}
          >
            <p className={styles.riskLevel}>Conservative</p>
            <p className={styles.riskDescription}>Flag all potential risks</p>
          </button>
          <button
            onClick={() => handleRiskToleranceChange('medium')}
            className={`${styles.riskOption} ${riskTolerance === 'medium' ? styles.selected : ''}`}
          >
            <p className={styles.riskLevel}>Balanced</p>
            <p className={styles.riskDescription}>Focus on significant risks</p>
          </button>
          <button
            onClick={() => handleRiskToleranceChange('high')}
            className={`${styles.riskOption} ${riskTolerance === 'high' ? styles.selected : ''}`}
          >
            <p className={styles.riskLevel}>Aggressive</p>
            <p className={styles.riskDescription}>Only critical risks</p>
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Legal Resources</label>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="hasLegalCounsel"
            checked={hasLegalCounsel}
            onChange={(e) => {
              setHasLegalCounsel(e.target.checked)
              setHasChanges(true)
            }}
            className={styles.checkbox}
          />
          <label htmlFor="hasLegalCounsel" className={styles.checkboxLabel}>
            I have access to legal counsel for complex matters
          </label>
        </div>
        <p className={styles.helperText}>
          This helps us tailor our recommendations appropriately
        </p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Common Contract Types</label>
        <p className={styles.helperText}>Select the types of contracts you work with most often</p>
        <div className={styles.industryGrid}>
          {contractTypes.map(type => (
            <button
              key={type}
              onClick={() => handleContractTypeToggle(type)}
              className={`${styles.industryOption} ${selectedContractTypes.includes(type) ? styles.selected : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Compliance Focus Areas</label>
        <p className={styles.helperText}>Select regulations and compliance areas relevant to your business</p>
        <div className={styles.industryGrid}>
          {complianceAreas.map(area => (
            <button
              key={area}
              onClick={() => handleComplianceAreaToggle(area)}
              className={`${styles.industryOption} ${selectedComplianceAreas.includes(area) ? styles.selected : ''}`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              setRiskTolerance(profile.risk_tolerance || 'medium')
              setHasLegalCounsel(profile.has_legal_counsel || false)
              setSelectedContractTypes([])
              setSelectedComplianceAreas([])
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

      <div className={styles.note}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p>
          Your legal preferences help our AI provide more relevant analysis and recommendations. 
          Contract types and compliance areas will be integrated into future analysis features.
        </p>
      </div>
    </div>
  )
}