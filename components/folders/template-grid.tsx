'use client'

import { useState } from 'react'
import { Template, TemplateFolder, templatesApi } from '@/lib/supabase-client'
import { Button, ConfirmationDialog } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import ContextMenu from './context-menu'
import FolderSelectionModal from './folder-selection-modal'
import RenameModal from './rename-modal'
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
  onNewTemplateFolder?: () => void
}

export default function TemplateGrid({
  templates,
  selectedTemplateFolder,
  templateFolders,
  onTemplateClick,
  onTemplatesUpdate,
  onUploadToFolder,
  onFolderClick,
  onBackToAll,
  onNewTemplateFolder
}: TemplateGridProps) {
  const notifications = useEnhancedNotifications()
  const { notify } = notifications
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [modalState, setModalState] = useState<{
    type: 'move' | 'copy' | 'rename' | 'delete' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    template: Template | null
  }>({ isOpen: false, template: null })
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    template: Template | null
  }>({ isOpen: false, position: { x: 0, y: 0 }, template: null })
  
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

  const getDisplaySubtitle = () => {
    const templateCount = templates.length
    const folderCount = selectedTemplateFolder ? 0 : templateFolders.length
    
    if (selectedTemplateFolder) {
      return `${templateCount} ${templateCount === 1 ? 'template' : 'templates'} in this folder`
    }
    
    const totalItems = templateCount + folderCount
    if (totalItems === 0) return 'No items'
    
    const parts = []
    if (folderCount > 0) parts.push(`${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}`)
    if (templateCount > 0) parts.push(`${templateCount} ${templateCount === 1 ? 'template' : 'templates'}`)
    
    return parts.join(', ')
  }
  
  const getFolderForTemplate = (template: Template) => {
    if (!template.folder_id) return null
    return templateFolders.find(f => f.id === template.folder_id)
  }

  // Handle template actions
  const handleMove = async (folderId: string | null) => {
    if (!selectedTemplate) return
    
    try {
      await templatesApi.update(selectedTemplate.id, { folder_id: folderId })
      notifications.success('File Moved', 'Template moved successfully')
      onTemplatesUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error moving template:', error)
      notifications.error('Operation Failed', 'Failed to move template')
    }
  }

  const handleCopy = async (folderId: string | null) => {
    if (!selectedTemplate) return
    
    try {
      const newTemplate = {
        user_id: selectedTemplate.user_id,
        title: `${selectedTemplate.title} (Copy)`,
        content: selectedTemplate.content,
        upload_url: selectedTemplate.upload_url,
        file_key: selectedTemplate.file_key,
        folder_id: folderId,
        analysis_cache: selectedTemplate.analysis_cache,
        analysis_status: selectedTemplate.analysis_status,
        analysis_progress: selectedTemplate.analysis_progress,
        resolved_risks: selectedTemplate.resolved_risks
      }
      
      await templatesApi.create(newTemplate)
      notifications.success('Success', 'Template copied successfully')
      onTemplatesUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error copying template:', error)
      notifications.error('Operation Failed', 'Failed to copy template')
    }
  }

  const handleRename = async (newName: string) => {
    if (!selectedTemplate) return
    
    try {
      await templatesApi.update(selectedTemplate.id, { title: newName })
      notifications.success('Success', 'Template renamed successfully')
      onTemplatesUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error renaming template:', error)
      notifications.error('Operation Failed', 'Failed to rename template')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmation.template) return
    
    try {
      await templatesApi.delete(deleteConfirmation.template.id)
      notifications.success('File Deleted', 'Template deleted successfully')
      onTemplatesUpdate()
      setDeleteConfirmation({ isOpen: false, template: null })
    } catch (error) {
      console.error('Error deleting template:', error)
      notifications.error('Operation Failed', 'Failed to delete template')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, template: Template) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      template
    })
    setSelectedTemplate(template)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={styles.gridHeader}>
        {selectedTemplateFolder && onBackToAll ? (
          <div className={styles.headerWithBack}>
            <button 
              className={styles.backButton}
              onClick={onBackToAll}
              title="Back to All Templates"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className={styles.headerContent}>
              <h1 className={styles.gridTitle}>{getDisplayTitle()}</h1>
              <p className={styles.gridSubtitle}>{getDisplaySubtitle()}</p>
            </div>
          </div>
        ) : (
          <div className={styles.headerContent}>
            <h1 className={styles.gridTitle}>{getDisplayTitle()}</h1>
            <p className={styles.gridSubtitle}>{getDisplaySubtitle()}</p>
          </div>
        )}
        
        {/* Header Actions */}
        <div className={styles.headerActions}>
          {onNewTemplateFolder && !selectedTemplateFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewTemplateFolder}
              className={styles.actionButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <path d="M12 11v6m3-3h-6"/>
              </svg>
              <span>New Folder</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const uploadInput = document.getElementById('template-upload') as HTMLInputElement
              if (uploadInput) {
                uploadInput.click()
              }
            }}
            className={styles.actionButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload Template</span>
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className={styles.contractGrid}>
        {templates.length === 0 && (selectedTemplateFolder || templateFolders.length === 0) ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <svg 
                className={styles.emptyStateIcon}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className={styles.emptyStateTitle}>
                {selectedTemplateFolder ? 'No templates in this folder' : 'No templates yet'}
              </h3>
              <p className={styles.emptyStateDescription}>
                {selectedTemplateFolder 
                  ? 'Upload templates directly to this folder or drag existing templates here from other folders.'
                  : 'Upload your first template to get started with AI-powered analysis and organization.'
                }
              </p>
              {onUploadToFolder && (
                <button
                  onClick={() => onUploadToFolder(selectedTemplateFolder)}
                  className={styles.emptyStateButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Upload Template
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Show template folders in All Templates view - OS Style */}
            {!selectedTemplateFolder && templateFolders.map((folder) => {
              const folderTemplateCount = templates.filter(t => t.folder_id === folder.id).length
              return (
                <div
                  key={`folder-${folder.id}`}
                  className={styles.osFileItem}
                  onClick={() => onFolderClick && onFolderClick(folder.id)}
                >
                  {/* Minimalist Folder Icon */}
                  <div className={styles.osIconContainer}>
                    <div className={styles.iconBackground}>
                      <svg 
                        className={styles.osFolder}
                        viewBox="0 0 24 24" 
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Folder Name */}
                  <div className={styles.osFileName}>
                    {folder.name}
                  </div>
                  
                  {/* Folder Meta Info */}
                  <div className={styles.osFileMeta}>
                    {folderTemplateCount} {folderTemplateCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
              )
            })}
            
            {/* Show templates - OS Style */}
            {templates.map((template) => {
              const templateFolder = getFolderForTemplate(template)
              return (
                <div
                  key={template.id}
                  className={styles.osFileItem}
                  onClick={() => onTemplateClick(template)}
                  onContextMenu={(e) => handleContextMenu(e, template)}
                >
                  {/* Minimalist Document Icon */}
                  <div className={styles.osIconContainer}>
                    <div className={styles.iconBackground}>
                      <svg 
                        className={styles.osDocument}
                        viewBox="0 0 24 24" 
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Template Name */}
                  <div className={styles.osFileName}>
                    {template.title}
                  </div>
                  
                  {/* Template Meta Info */}
                  <div className={styles.osFileMeta}>
                    {templateFolder ? (
                      <span>{templateFolder.name}</span>
                    ) : (
                      <span className={styles.uncategorizedLabel}>
                        <span className={styles.redDot}></span>
                        Uncategorized
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, template: null })}
        onMove={() => {
          setModalState({ type: 'move', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, template: null })
        }}
        onCopy={() => {
          setModalState({ type: 'copy', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, template: null })
        }}
        onRename={() => {
          setModalState({ type: 'rename', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, template: null })
        }}
        onDelete={() => {
          setDeleteConfirmation({ isOpen: true, template: contextMenu.template })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, template: null })
        }}
      />

      {/* Modals */}
      {modalState.type === 'move' && selectedTemplate && (
        <FolderSelectionModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedTemplate(null)
          }}
          onSelect={handleMove}
          folders={templateFolders}
          title="Move Template"
          currentFolderId={selectedTemplate.folder_id}
          fileType="template"
        />
      )}

      {modalState.type === 'copy' && selectedTemplate && (
        <FolderSelectionModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedTemplate(null)
          }}
          onSelect={handleCopy}
          folders={templateFolders}
          title="Copy Template"
          currentFolderId={selectedTemplate.folder_id}
          fileType="template"
        />
      )}

      {modalState.type === 'rename' && selectedTemplate && (
        <RenameModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedTemplate(null)
          }}
          onRename={handleRename}
          currentName={selectedTemplate.title}
          itemType="template"
        />
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, template: null })}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirmation.template?.title}"? This action cannot be undone.`}
        type="danger"
      />

      {/* Render toasts */}
      {/* Toasts are now handled by the notification system */}
    </div>
  )
}