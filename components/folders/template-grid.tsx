'use client'

import { Template, TemplateFolder } from '@/lib/supabase-client'
import styles from '@/app/folders/folders.module.css'

interface TemplateGridProps {
  templates: Template[]
  selectedTemplateFolder: string | null
  templateFolders: TemplateFolder[]
  onTemplateClick: (template: Template) => void
  onTemplatesUpdate: () => void
  onUploadToFolder?: (folderId: string | null) => void
  onFolderClick?: (folderId: string) => void
  onBackToAll?: () => void
}

export default function TemplateGrid({
  templates,
  selectedTemplateFolder,
  templateFolders,
  onTemplateClick,
  onTemplatesUpdate,
  onUploadToFolder,
  onFolderClick,
  onBackToAll
}: TemplateGridProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDisplayTitle = () => {
    if (selectedTemplateFolder) {
      const folder = templateFolders.find(f => f.id === selectedTemplateFolder)
      return folder ? folder.name : 'Unknown Template Folder'
    }
    return 'All Templates'
  }

  const getAnalysisStatusText = (status: string | null, progress: number | null) => {
    if (!status || status === 'pending') return 'Not analyzed'
    if (status === 'in_progress') return `Analyzing... ${progress || 0}%`
    if (status === 'complete') return 'Analysis complete'
    if (status === 'failed') return 'Analysis failed'
    return status
  }

  const getAnalysisStatusColor = (status: string | null) => {
    if (!status || status === 'pending') return '#6B7280'
    if (status === 'in_progress') return '#F59E0B'
    if (status === 'complete') return '#10B981'
    if (status === 'failed') return '#EF4444'
    return '#6B7280'
  }

  return (
    <div className={styles.gridContainer}>
      {/* Header */}
      <div className={styles.gridHeader}>
        <div className={styles.gridTitle}>
          <h2>{getDisplayTitle()}</h2>
          <span className={styles.itemCount}>({templates.length} templates)</span>
        </div>
        
        {selectedTemplateFolder && (
          <button
            onClick={onBackToAll}
            className={styles.backButton}
          >
            ← Back to All Templates
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className={styles.grid}>
        {templates.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <h3>No templates found</h3>
            <p>
              {selectedTemplateFolder 
                ? 'This folder is empty. Upload some templates to get started.' 
                : 'Upload your first template to begin building your template library.'}
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={styles.gridItem}
              onClick={() => onTemplateClick(template)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.itemIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemTitle}>{template.title}</h3>
                  <p className={styles.itemDate}>Created {formatDate(template.created_at)}</p>
                </div>
              </div>

              <div className={styles.itemMeta}>
                <div className={styles.analysisStatus}>
                  <div 
                    className={styles.statusDot}
                    style={{ backgroundColor: getAnalysisStatusColor(template.analysis_status) }}
                  ></div>
                  <span style={{ color: getAnalysisStatusColor(template.analysis_status) }}>
                    {getAnalysisStatusText(template.analysis_status, template.analysis_progress)}
                  </span>
                </div>
              </div>

              <div className={styles.itemActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTemplateClick(template)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View Template
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}