'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import styles from './template-version-modal.module.css'

interface TemplateVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    version_name: string
    vendor_name?: string
    notes?: string
  }) => void
  loading?: boolean
}

export default function TemplateVersionModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: TemplateVersionModalProps) {
  const [formData, setFormData] = useState({
    version_name: '',
    vendor_name: '',
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.version_name.trim()) return

    onSubmit({
      version_name: formData.version_name.trim(),
      vendor_name: formData.vendor_name.trim() || undefined,
      notes: formData.notes.trim() || undefined
    })

    // Reset form
    setFormData({
      version_name: '',
      vendor_name: '',
      notes: ''
    })
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        version_name: '',
        vendor_name: '',
        notes: ''
      })
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Create Template Version</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="version_name">Version Name *</label>
            <input
              type="text"
              id="version_name"
              value={formData.version_name}
              onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
              placeholder="e.g., v1.0, Draft 2024-01"
              required
              disabled={loading}
            />
            <span className={styles.hint}>
              Create a descriptive name for this version
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="vendor_name">Vendor Name</label>
            <input
              type="text"
              id="vendor_name"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              placeholder="e.g., Acme Corp, Legal Partners LLC"
              disabled={loading}
            />
            <span className={styles.hint}>
              Optional: Specify the vendor associated with this version
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this version..."
              rows={3}
              disabled={loading}
            />
            <span className={styles.hint}>
              Optional: Add notes about changes or context
            </span>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.version_name.trim()}
            >
              {loading ? 'Creating...' : 'Create Version'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}