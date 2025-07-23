'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/services/subscription'
import { Button } from '@/components/ui'
import SingleJurisdictionSelector from './single-jurisdiction-selector'
import { jurisdictionData } from '@/lib/jurisdiction-data'
import styles from './profile-components.module.css'

interface JurisdictionSettingsProps {
  profile: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>
  saving: boolean
}

interface AdditionalJurisdiction {
  code: string
  name: string
  purpose: 'vendor' | 'client' | 'subsidiary' | 'partner' | 'other'
  companies?: string[]
  complianceAreas?: string[]
  active: boolean
}

export default function JurisdictionSettings({ profile, onUpdate, saving }: JurisdictionSettingsProps) {
  // Convert display name to key if needed
  const getJurisdictionKey = (value: string | undefined): string => {
    if (!value) return 'united-states'
    
    // Check if it's already a key
    if (jurisdictionData[value]) return value
    
    // Otherwise, find the key by matching the name
    const entry = Object.entries(jurisdictionData).find(
      ([_, data]) => data.name === value
    )
    return entry ? entry[0] : 'united-states'
  }
  
  const [primaryJurisdiction, setPrimaryJurisdiction] = useState(
    getJurisdictionKey(profile.primary_jurisdiction)
  )
  const [additionalJurisdictions, setAdditionalJurisdictions] = useState<AdditionalJurisdiction[]>(
    Array.isArray(profile.additional_jurisdictions) 
      ? profile.additional_jurisdictions.map(j => {
          if (typeof j === 'string') {
            return { code: j, name: j, purpose: 'other' as const, active: true }
          }
          // Clean up old data format - ensure code and name are jurisdiction keys
          const jurisdiction = j as AdditionalJurisdiction
          const code = jurisdiction.code || jurisdiction.name
          // If the code is a valid jurisdiction key, use it
          if (jurisdictionData[code]) {
            return { ...jurisdiction, code, name: code }
          }
          return jurisdiction
        })
      : []
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = async () => {
    // Save the key format to database for consistency
    await onUpdate({
      primary_jurisdiction: primaryJurisdiction,
      additional_jurisdictions: additionalJurisdictions,
    })
    setHasChanges(false)
  }

  const handlePrimaryChange = (jurisdiction: string) => {
    setPrimaryJurisdiction(jurisdiction)
    setHasChanges(true)
  }

  const handleAddJurisdiction = (jurisdiction: string) => {
    const newJurisdiction: AdditionalJurisdiction = {
      code: jurisdiction,
      name: jurisdiction,
      purpose: 'other',
      active: true,
    }
    setAdditionalJurisdictions([...additionalJurisdictions, newJurisdiction])
    setHasChanges(true)
    setShowAddModal(false)
  }

  const handleRemoveJurisdiction = (index: number) => {
    const updated = additionalJurisdictions.filter((_, i) => i !== index)
    setAdditionalJurisdictions(updated)
    setHasChanges(true)
  }

  const handleUpdateJurisdiction = (index: number, updates: Partial<AdditionalJurisdiction>) => {
    const updated = [...additionalJurisdictions]
    updated[index] = { ...updated[index], ...updates }
    setAdditionalJurisdictions(updated)
    setHasChanges(true)
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Jurisdiction Settings</h2>
      <p className={styles.sectionDescription}>
        Configure your primary jurisdiction and any additional jurisdictions for cross-border contracts
      </p>

      <div className={styles.jurisdictionCard}>
        <div className={styles.jurisdictionHeader}>
          <h3 className={styles.jurisdictionTitle}>Primary Jurisdiction</h3>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Your company operates in:</label>
          <SingleJurisdictionSelector
            value={primaryJurisdiction}
            onChange={handlePrimaryChange}
            excludeJurisdictions={additionalJurisdictions.map(j => j.code || j.name)}
            placeholder="Select primary jurisdiction"
          />
          <p className={styles.helperText}>
            This is where your company is primarily based and operates
          </p>
        </div>
      </div>

      <div className={styles.jurisdictionCard}>
        <div className={styles.jurisdictionHeader}>
          <h3 className={styles.jurisdictionTitle}>Additional Jurisdictions</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles.addButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Jurisdiction
          </button>
        </div>
        
        {additionalJurisdictions.length === 0 ? (
          <p className={styles.helperText}>
            Add jurisdictions where you have vendors, clients, or business operations
          </p>
        ) : (
          <div className={styles.jurisdictionList}>
            {additionalJurisdictions.map((jurisdiction, index) => {
              const jurisdictionKey = jurisdiction.code || jurisdiction.name
              const jurisdictionInfo = jurisdictionData[jurisdictionKey]
              const displayName = jurisdictionInfo ? `${jurisdictionInfo.flag} ${jurisdictionInfo.name}` : jurisdiction.name
              
              return (
                <div key={index} className={styles.jurisdictionTag}>
                  <span>{displayName}</span>
                  <button
                    onClick={() => handleRemoveJurisdiction(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div 
            className={`${styles.modalContent} ${styles.modalContentJurisdiction}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Additional Jurisdiction</h3>
            <div className={styles.modalBody}>
              <SingleJurisdictionSelector
                value=""
                onChange={handleAddJurisdiction}
                excludeJurisdictions={[primaryJurisdiction, ...additionalJurisdictions.map(j => j.code || j.name)]}
                placeholder="Select jurisdiction"
              />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {hasChanges && (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              setPrimaryJurisdiction(getJurisdictionKey(profile.primary_jurisdiction))
              setAdditionalJurisdictions(
                Array.isArray(profile.additional_jurisdictions) 
                  ? profile.additional_jurisdictions.map(j => {
                      if (typeof j === 'string') {
                        return { code: j, name: j, purpose: 'other' as const, active: true }
                      }
                      // Clean up old data format - ensure code and name are jurisdiction keys
                      const jurisdiction = j as AdditionalJurisdiction
                      const code = jurisdiction.code || jurisdiction.name
                      // If the code is a valid jurisdiction key, use it
                      if (jurisdictionData[code]) {
                        return { ...jurisdiction, code, name: code }
                      }
                      return jurisdiction
                    })
                  : []
              )
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
          Jurisdiction settings will be used to analyze contracts for compliance with relevant laws and regulations.
          AI-powered analysis will include web searches for current legal requirements in each jurisdiction.
        </p>
      </div>
    </div>
  )
}

/* Additional modal styles */
const modalStyles = `
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modalContent {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modalContent h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}
`