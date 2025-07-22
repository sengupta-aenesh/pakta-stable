'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import { notificationHelpers } from '@/components/notifications/notification.utils'
import TemplateVersionModal from './template-version-modal'
import styles from './template-version-list.module.css'

interface TemplateVersion {
  id: string
  version_name: string
  vendor_name?: string
  notes?: string
  created_at: string
  updated_at?: string
}

interface TemplateVersionListProps {
  templateId: string
  onTemplateRestore?: () => void
}

export default function TemplateVersionList({
  templateId,
  onTemplateRestore
}: TemplateVersionListProps) {
  const notifications = useEnhancedNotifications()
  const { notify } = notifications
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch versions
  const fetchVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/template/versions?templateId=${templateId}`)
      const data = await response.json()

      if (data.success) {
        setVersions(data.versions || [])
      } else {
        throw new Error(data.error || 'Failed to fetch versions')
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
      notifications.error('Load Failed', 'Failed to load versions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (templateId) {
      fetchVersions()
    }
  }, [templateId])

  // Create version
  const handleCreateVersion = async (data: {
    version_name: string
    vendor_name?: string
    notes?: string
  }) => {
    try {
      setCreating(true)

      const response = await fetch('/api/template/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          ...data
        }),
      })

      const result = await response.json()

      if (result.success) {
        notify(notificationHelpers.versionCreated(data.version_name))
        setShowCreateModal(false)
        fetchVersions() // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to create version')
      }
    } catch (error) {
      console.error('Error creating version:', error)
      notifications.error('Creation Failed', 'Failed to create version')
    } finally {
      setCreating(false)
    }
  }

  // Restore from version
  const handleRestoreVersion = async (versionId: string, versionName: string) => {
    try {
      setActionLoading(versionId)

      const response = await fetch(`/api/template/versions/${versionId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        notifications.success('Version Restored', result.message || `Template restored from version "${versionName}"`)
        if (onTemplateRestore) {
          onTemplateRestore()
        }
      } else {
        throw new Error(result.error || 'Failed to restore version')
      }
    } catch (error) {
      console.error('Error restoring version:', error)
      notifications.error('Restore Failed', 'Failed to restore from version')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete version
  const handleDeleteVersion = async (versionId: string, versionName: string) => {
    if (!confirm(`Are you sure you want to delete version "${versionName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(versionId)

      const response = await fetch(`/api/template/versions/${versionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        notifications.success('Version Deleted', `Version "${versionName}" deleted successfully`)
        fetchVersions() // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete version')
      }
    } catch (error) {
      console.error('Error deleting version:', error)
      notifications.error('Delete Failed', 'Failed to delete version')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading versions...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Template Versions ({versions.length})</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          Create Version
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No versions created yet.</p>
          <p>Create your first version to track changes and collaborate with vendors.</p>
        </div>
      ) : (
        <div className={styles.versionsList}>
          {versions.map((version) => (
            <div key={version.id} className={styles.versionCard}>
              <div className={styles.versionHeader}>
                <div className={styles.versionInfo}>
                  <h4>{version.version_name}</h4>
                  {version.vendor_name && (
                    <span className={styles.vendorBadge}>{version.vendor_name}</span>
                  )}
                </div>
                <div className={styles.versionDate}>
                  {new Date(version.created_at).toLocaleDateString()}
                </div>
              </div>

              {version.notes && (
                <div className={styles.versionNotes}>
                  {version.notes}
                </div>
              )}

              <div className={styles.versionActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestoreVersion(version.id, version.version_name)}
                  disabled={actionLoading === version.id}
                >
                  {actionLoading === version.id ? 'Restoring...' : 'Restore'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteVersion(version.id, version.version_name)}
                  disabled={actionLoading === version.id}
                  className={styles.deleteButton}
                >
                  {actionLoading === version.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateVersionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateVersion}
        loading={creating}
      />
    </div>
  )
}