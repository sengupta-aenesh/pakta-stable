'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Make this page dynamic to avoid Suspense issues
export const dynamic = 'force-dynamic'
import { Template, templatesApi, TemplateFolder, templateFoldersApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { Button, TopNavigation } from '@/components/ui'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import TemplateAnalysisSimple from '@/components/templates/template-analysis-simple'
import InteractiveTemplateEditor from '@/components/templates/interactive-template-editor'
import TrialStatus from '@/components/subscription/trial-status'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import styles from './template-dashboard.module.css'

type MobileView = 'list' | 'editor' | 'analysis'

function TemplateDashboardContent() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateFolders, setTemplateFolders] = useState<TemplateFolder[]>([])
  const [selectedTemplateFolder, setSelectedTemplateFolder] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Array<{
    id: string
    label: string
    userInput: string
    fieldType: string
  }>>([])
  const [isVersionMode, setIsVersionMode] = useState(false)
  const [versionData, setVersionData] = useState<{
    variables: Array<{
      id: string
      label: string
      value: string
      fieldType: string
    }>
    versionName: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const reanalyzeRisksRef = useRef<(() => Promise<void>) | null>(null)
  const [updateTemplateContentFunction, setUpdateTemplateContentFunction] = useState<((content: string | null) => void) | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Using notification system instead of toasts
  const notifications = useEnhancedNotifications()

  // Stable callback for registering update function to prevent infinite loops
  const handleRegisterUpdateFunction = useCallback((fn: (content: string | null) => void) => {
    setUpdateTemplateContentFunction(() => fn)
  }, [])

  // Stable callback for registering reanalysis function using ref to avoid state updates during render
  const handleRegisterReanalysisFunction = useCallback((fn: () => Promise<void>) => {
    reanalyzeRisksRef.current = fn
  }, [])

  // Template selection handler - optimized to prevent cascading re-renders
  const handleTemplateSelect = useCallback(async (template: Template, fromURL = false) => {
    console.log('🚨 DEBUG: handleTemplateSelect called with:', {
      templateId: template.id,
      templateTitle: template.title,
      fromURL,
      currentSelectedId: selectedTemplate?.id,
      templateContent: template.content?.substring(0, 100) + '...'
    })
    
    // Prevent unnecessary re-selection of the same template
    if (selectedTemplate?.id === template.id) {
      console.log('✅ Template already selected, skipping re-selection:', template.id)
      return
    }
    
    console.log('🎯 Template selected - START:', {
      templateId: template.id,
      templateTitle: template.title,
      source: fromURL ? 'URL' : 'sidebar',
      currentSelected: selectedTemplate?.id || 'none'
    })
    
    // Only update URL if this is a manual selection (not from URL monitoring)
    if (!fromURL) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('templateId', template.id)
      window.history.pushState({}, '', newUrl.toString())
    }
    
    // Set the new template
    setSelectedTemplate(template)
    
    // Log analysis cache structure for debugging
    console.log('🔍 Template analysis cache structure:', {
      hasAnalysisCache: !!template.analysis_cache,
      analysisStatus: template.analysis_status,
      analysisProgress: template.analysis_progress,
      cacheKeys: template.analysis_cache ? Object.keys(template.analysis_cache) : [],
      hasSummary: !!template.analysis_cache?.summary,
      hasComplete: !!template.analysis_cache?.complete
    })
    
    // On mobile, switch to analysis view when template is selected
    if (window.innerWidth <= 768) {
      setMobileView('analysis')
    }
    
    console.log('🎯 Template selected - COMPLETE:', template.id)
  }, [selectedTemplate?.id]) // Only depend on the ID to prevent excessive re-renders

  // Debug code removed - using notification system now

  // URL monitoring for template selection
  useEffect(() => {
    const templateId = searchParams.get('templateId')
    
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId)
      
      if (template) {
        console.log('🔗 URL template selection:', {
          templateId,
          templateTitle: template.title,
          alreadySelected: selectedTemplate?.id === templateId
        })
        
        if (selectedTemplate?.id !== templateId) {
          handleTemplateSelect(template, true)
        }
      } else {
        console.warn('⚠️ Template not found in URL:', templateId)
        // Clear invalid template ID from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('templateId')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [searchParams, templates, selectedTemplate?.id, handleTemplateSelect])

  useEffect(() => {
    loadUserAndData()
  }, [])

  async function loadUserAndData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      await Promise.all([
        loadTemplates(currentUser.id),
        loadTemplateFolders(currentUser.id)
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      notifications.error('Operation Failed', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function loadTemplates(userId: string) {
    const userTemplates = await templatesApi.getAll(userId)
    setTemplates(userTemplates)
  }

  async function loadTemplateFolders(userId: string) {
    try {
      const userTemplateFolders = await templateFoldersApi.getAll(userId)
      setTemplateFolders(userTemplateFolders)
    } catch (error) {
      console.error('Error loading template folders:', error)
    }
  }

  async function handleSignOut() {
    const { signOut } = await import('@/lib/auth-client')
    await signOut()
    router.push('/auth/login')
  }


  // Handle version creation - switch to version mode
  const handleVersionCreate = useCallback((variables: Array<{ id: string; label: string; value: string; fieldType: string }>, versionName: string) => {
    console.log('🔄 Switching to version mode with variables:', variables)
    setVersionData({ variables, versionName })
    setIsVersionMode(true)
  }, [])

  // Handle back to original - switch back to template mode
  const handleBackToOriginal = useCallback(() => {
    console.log('🔄 Switching back to original template mode')
    setIsVersionMode(false)
    setVersionData(null)
  }, [])

  // Handle template content changes
  const handleTemplateContentChange = useCallback(async (content: string | null) => {
    if (!selectedTemplate) return
    
    const safeContent = content || ''
    console.log('📝 handleTemplateContentChange called:', { 
      contentLength: safeContent.length, 
      templateId: selectedTemplate.id,
      wasNull: content === null
    })
    
    try {
      await templatesApi.update(selectedTemplate.id, { content: safeContent })
      // Update the local template state
      setSelectedTemplate(prev => prev ? { ...prev, content: safeContent } : null)
      // Clear variables cache when content changes as they may no longer be accurate
      setTemplateVariables([])
      notifications.success('Success', 'Template updated successfully')
    } catch (error) {
      console.error('Error updating template:', error)
      notifications.error('Operation Failed', 'Failed to update template')
    }
  }, [selectedTemplate])

  // Handle template title update with automatic saving
  const handleTemplateTitleChange = useCallback(async (newTitle: string) => {
    if (!selectedTemplate || !newTitle.trim()) return
    
    const trimmedTitle = newTitle.trim()
    
    // Update local state immediately for responsive UI
    setSelectedTemplate(prev => prev ? { ...prev, title: trimmedTitle } : null)
    
    // Update in templates array as well
    setTemplates(prev => prev.map(template => 
      template.id === selectedTemplate.id 
        ? { ...template, title: trimmedTitle }
        : template
    ))
    
    try {
      // Save to database
      await templatesApi.update(selectedTemplate.id, { title: trimmedTitle })
      console.log('✅ Template title updated successfully:', trimmedTitle)
      notifications.success('Success', 'Template title updated')
    } catch (error) {
      console.error('❌ Failed to update template title:', error)
      notifications.error('Operation Failed', 'Failed to update title')
      
      // Revert on error
      setSelectedTemplate(prev => prev ? { ...prev, title: selectedTemplate.title } : null)
      setTemplates(prev => prev.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, title: selectedTemplate.title }
          : template
      ))
    }
  }, [selectedTemplate])

  // Debounced title saving to avoid saving on every keystroke
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectedTemplateRef = useRef<Template | null>(null)
  
  // Keep ref in sync with selectedTemplate
  useEffect(() => {
    selectedTemplateRef.current = selectedTemplate
  }, [selectedTemplate])
  
  const handleTitleInputChange = useCallback((newTitle: string) => {
    console.log('📝 handleTitleInputChange called with:', newTitle)
    
    const currentTemplate = selectedTemplateRef.current
    if (!currentTemplate) {
      console.log('❌ No selected template for title change')
      return
    }
    
    console.log('🔄 Updating title from', currentTemplate.title, 'to', newTitle)
    
    // Update local state immediately for responsive UI
    setSelectedTemplate(prev => {
      if (!prev) return null
      const updated = { ...prev, title: newTitle }
      console.log('✅ Updated selectedTemplate title:', updated.title)
      return updated
    })
    
    // Also update in templates array immediately
    setTemplates(prev => prev.map(template => 
      template.id === currentTemplate.id 
        ? { ...template, title: newTitle }
        : template
    ))
    
    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current)
    }
    
    // Set new timeout to save after user stops typing
    titleSaveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-saving title after timeout:', newTitle)
      handleTemplateTitleChange(newTitle)
    }, 1000) // Save 1 second after user stops typing
  }, [handleTemplateTitleChange])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* iOS-Style Top Navigation with Template Title */}
      <TopNavigation 
        currentPage="template-dashboard"
        contractTitle={selectedTemplate?.title || ''}
        onContractTitleChange={selectedTemplate ? handleTitleInputChange : undefined}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Trial Status */}
      <TrialStatus />

      {/* Main Container with Sidebar and Content */}
      <div className={styles.mainContainer}>
        {/* Left Sidebar */}
        <div className={mobileView === 'list' ? styles.mobileVisible : styles.mobileHidden}>
          <UnifiedSidebar
            folders={[]} // Empty for template dashboard
            contracts={[]} // Empty for template dashboard
            selectedFolder={null}
            onSelectFolder={() => {}}
            onFoldersUpdate={() => {}}
            onContractsUpdate={() => {}}
            onContractClick={() => {}}
            // Template props
            templateFolders={templateFolders}
            templates={templates}
            selectedTemplateFolder={selectedTemplateFolder}
            onSelectTemplateFolder={setSelectedTemplateFolder}
            onTemplateFoldersUpdate={() => loadTemplateFolders(user.id)}
            onTemplatesUpdate={() => loadTemplates(user.id)}
            onTemplateClick={handleTemplateSelect}
            // Common props
            user={user}
            // DEBUG: Log templates array
            {...(() => {
              console.log('🚨 DEBUG: UnifiedSidebar render - templates:', {
                count: templates.length,
                templateIds: templates.map(t => ({ id: t.id, title: t.title }))
              })
              return {}
            })()}
            showUserSection={true}
            onSignOut={handleSignOut}
            // Notification system is used internally
            // View mode - force templates
            viewMode="templates"
            onViewModeChange={() => {}} // No switching in template dashboard
          />
        </div>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {selectedTemplate ? (
            <>
              {/* Editor Panel */}
              <div className={`${styles.editorPanel} ${mobileView === 'editor' ? styles.mobileVisible : styles.mobileHidden}`}>
                {/* DEBUG: Show current selectedTemplate state */}
                {console.log('🚨 DEBUG: Main content render - selectedTemplate:', {
                  exists: !!selectedTemplate,
                  id: selectedTemplate?.id,
                  title: selectedTemplate?.title
                })}
                <InteractiveTemplateEditor
                  template={selectedTemplate}
                  templateVariables={templateVariables}
                  isVersionMode={isVersionMode}
                  versionData={versionData}
                  onBackToOriginal={handleBackToOriginal}
                  onContentChange={handleTemplateContentChange}
                  onComment={(text, position) => {
                    // Handle comment creation for templates
                    const comment = prompt(`Add comment for template: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"\n\nEnter your comment:`)
                    if (comment) {
                      notifications.success('Success', `Comment added: ${comment}`)
                    }
                  }}
                  onReanalyzeRisks={reanalyzeRisksRef.current}
                  onRegisterUpdateFunction={handleRegisterUpdateFunction}
                  onEditModeChange={setIsEditMode}
                  className={styles.templateEditor}
                />
              </div>

              {/* Analysis Panel */}
              <div className={`${styles.analysisPanel} ${mobileView === 'analysis' ? styles.mobileVisible : styles.mobileHidden}`}>
                <TemplateAnalysisSimple
                  template={selectedTemplate}
                  onTemplateUpdate={(updatedTemplate) => {
                    console.log('📥 Template dashboard received updated template:', {
                      id: updatedTemplate.id,
                      title: updatedTemplate.title,
                      status: updatedTemplate.analysis_status,
                      hasCache: !!updatedTemplate.analysis_cache,
                      hasSummary: !!updatedTemplate.analysis_cache?.summary
                    })
                    setSelectedTemplate(updatedTemplate)
                    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
                  }}
                  onVariablesUpdate={(variables) => {
                    console.log('🔄 Variables updated from analysis component:', variables)
                    setTemplateVariables(variables)
                  }}
                  onVersionCreate={handleVersionCreate}
                  onToast={(msg, type) => {
                    // Map old onToast calls to new notification system
                    if (type === 'success') notifications.success('Success', msg)
                    else if (type === 'error') notifications.error('Error', msg)
                    else notifications.info('Info', msg)
                  }}
                  isEditMode={isEditMode}
                />
              </div>
            </>
          ) : (
            <div className={styles.welcomeScreen}>
              <div className={styles.welcomeContent}>
                <div className={styles.welcomeIconWrapper}>
                  <div className={styles.welcomeIconBackground}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      <path d="M13 3v5a2 2 0 002 2h5"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className={styles.welcomeTitle}>Select a Template to Begin</h2>
                <p className={styles.welcomeDescription}>
                  Choose a template from the sidebar to start analyzing and creating versions.
                </p>
                
                {templates.length === 0 ? (
                  <div className={styles.welcomeActions}>
                    <div className={styles.welcomeEmptyState}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>No templates yet</span>
                    </div>
                    <p className={styles.welcomeHint}>
                      Upload your first template using the button in the sidebar
                    </p>
                  </div>
                ) : (
                  <div className={styles.welcomeStats}>
                    <div className={styles.welcomeStatItem}>
                      <span className={styles.welcomeStatNumber}>{templates.length}</span>
                      <span className={styles.welcomeStatLabel}>Templates Available</span>
                    </div>
                    <div className={styles.welcomeStatItem}>
                      <span className={styles.welcomeStatNumber}>{templateFolders.length}</span>
                      <span className={styles.welcomeStatLabel}>Folders</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toasts are now handled by the notification system */}
    </div>
  )
}

export default function TemplateDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    }>
      <TemplateDashboardContent />
    </Suspense>
  )
}