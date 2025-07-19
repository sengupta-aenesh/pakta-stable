'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Template } from '@/lib/supabase-client'
import { Button } from '@/components/ui'
import styles from './interactive-template-editor.module.css'

interface InteractiveTemplateEditorProps {
  template: Template
  onTemplateUpdate: (template: Template) => void
  onRegisterUpdateFunction?: (fn: (content: string | null) => void) => void
  onRegisterReanalysisFunction?: (fn: () => Promise<void>) => void
  onRisksUpdate?: (risks: any[]) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function InteractiveTemplateEditor({
  template,
  onTemplateUpdate,
  onRegisterUpdateFunction,
  onRegisterReanalysisFunction,
  onRisksUpdate,
  onToast
}: InteractiveTemplateEditorProps) {
  const [content, setContent] = useState<string>(template.content || '')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize content when template changes
  useEffect(() => {
    setContent(template.content || '')
    setHasUnsavedChanges(false)
  }, [template.id, template.content])

  // Auto-save functionality
  const autoSave = useCallback(async (newContent: string) => {
    if (!template?.id || saving) return

    try {
      setSaving(true)
      const response = await fetch(`/api/template/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      })

      if (!response.ok) throw new Error('Failed to save template')

      const updatedTemplate = await response.json()
      onTemplateUpdate(updatedTemplate)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving template:', error)
      onToast('Failed to save template', 'error')
    } finally {
      setSaving(false)
    }
  }, [template?.id, saving, onTemplateUpdate, onToast])

  // Handle content changes with debounced auto-save
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(true)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(newContent)
    }, 2000) // Auto-save after 2 seconds of no typing
  }, [autoSave])

  // Manual save function
  const handleSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await autoSave(content)
  }, [autoSave, content])

  // Register update function for parent component
  useEffect(() => {
    if (onRegisterUpdateFunction) {
      onRegisterUpdateFunction((newContent: string | null) => {
        setContent(newContent || '')
      })
    }
  }, [onRegisterUpdateFunction])

  // Reanalyze template function
  const reanalyzeTemplate = useCallback(async () => {
    if (!template?.id || analyzing) return

    try {
      setAnalyzing(true)
      onToast('Starting template reanalysis...', 'info')

      // First save current content
      if (hasUnsavedChanges) {
        await handleSave()
      }

      const response = await fetch('/api/template/auto-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          forceRefresh: true
        }),
      })

      if (!response.ok) throw new Error('Failed to reanalyze template')

      const result = await response.json()
      
      if (result.success && result.results?.risks) {
        // Update risks in parent component
        const risks = Array.isArray(result.results.risks) 
          ? result.results.risks 
          : result.results.risks.risks || []
        
        if (onRisksUpdate) {
          onRisksUpdate(risks)
        }

        onToast('Template reanalysis completed!', 'success')
      } else {
        throw new Error('Reanalysis completed but no risks data received')
      }
    } catch (error) {
      console.error('Reanalysis error:', error)
      onToast('Template reanalysis failed', 'error')
    } finally {
      setAnalyzing(false)
    }
  }, [template?.id, analyzing, hasUnsavedChanges, handleSave, onRisksUpdate, onToast])

  // Register reanalysis function for parent component
  useEffect(() => {
    if (onRegisterReanalysisFunction) {
      onRegisterReanalysisFunction(reanalyzeTemplate)
    }
  }, [onRegisterReanalysisFunction, reanalyzeTemplate])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getSaveStatusText = () => {
    if (saving) return 'Saving...'
    if (hasUnsavedChanges) return 'Unsaved changes'
    if (lastSaved) return `Saved at ${formatLastSaved(lastSaved)}`
    return 'No changes'
  }

  const getSaveStatusColor = () => {
    if (saving) return '#F59E0B'
    if (hasUnsavedChanges) return '#DC2626'
    if (lastSaved) return '#10B981'
    return '#6B7280'
  }

  return (
    <div className={styles.editorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>{template.title}</h2>
          <div className={styles.saveStatus} style={{ color: getSaveStatusColor() }}>
            {getSaveStatusText()}
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            variant="secondary"
            size="sm"
          >
            {saving ? 'Saving...' : 'Save Now'}
          </Button>
          
          <Button
            onClick={reanalyzeTemplate}
            disabled={analyzing}
            variant="primary"
            size="sm"
          >
            {analyzing ? 'Analyzing...' : 'Reanalyze'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={styles.editorSection}>
        <textarea
          className={styles.editor}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Template content will appear here..."
          disabled={saving}
        />
        
        {/* Editor Footer */}
        <div className={styles.editorFooter}>
          <div className={styles.editorStats}>
            <span>{content.length} characters</span>
            <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
            <span>{content.split('\n').length} lines</span>
          </div>
          
          <div className={styles.editorActions}>
            {hasUnsavedChanges && (
              <span className={styles.unsavedIndicator}>
                ● Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Progress */}
      {analyzing && (
        <div className={styles.analysisProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <span>Analyzing template content...</span>
        </div>
      )}

      {/* Template Info Panel */}
      <div className={styles.infoPanel}>
        <h3>Template Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Created</label>
            <span>{new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className={styles.infoItem}>
            <label>Last Updated</label>
            <span>{new Date(template.updated_at).toLocaleDateString()}</span>
          </div>
          
          <div className={styles.infoItem}>
            <label>Analysis Status</label>
            <span className={styles.status} style={{ 
              color: template.analysis_status === 'complete' ? '#10B981' : 
                     template.analysis_status === 'failed' ? '#DC2626' : '#6B7280' 
            }}>
              {template.analysis_status || 'Pending'}
            </span>
          </div>

          {template.resolved_risks && template.resolved_risks.length > 0 && (
            <div className={styles.infoItem}>
              <label>Resolved Risks</label>
              <span className={styles.resolvedCount}>{template.resolved_risks.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}