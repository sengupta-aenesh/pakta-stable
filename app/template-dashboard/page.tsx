'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Make this page dynamic to avoid Suspense issues
export const dynamic = 'force-dynamic'
import { Template, templatesApi, TemplateFolder, templateFoldersApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { Button, useToast, Toast, TopNavigation } from '@/components/ui'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import TemplateAnalysis from '@/components/templates/template-analysis'
import InteractiveTemplateEditor from '@/components/templates/interactive-template-editor'
import TrialStatus from '@/components/subscription/trial-status'
import styles from './template-dashboard.module.css'

type MobileView = 'list' | 'editor' | 'analysis'

function TemplateDashboardContent() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateFolders, setTemplateFolders] = useState<TemplateFolder[]>([])
  const [selectedTemplateFolder, setSelectedTemplateFolder] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateRisks, setTemplateRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const reanalyzeRisksRef = useRef<(() => Promise<void>) | null>(null)
  const [updateTemplateContentFunction, setUpdateTemplateContentFunction] = useState<((content: string | null) => void) | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast, toasts, removeToast } = useToast()

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
    
    // Clear previous template data immediately to prevent conflicts
    setTemplateRisks([])
    
    // Only update URL if this is a manual selection (not from URL monitoring)
    if (!fromURL) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('templateId', template.id)
      window.history.pushState({}, '', newUrl.toString())
    }
    
    // Set the new template
    setSelectedTemplate(template)
    
    // Load cached risks from RiskAnalysis object
    if (template.analysis_cache?.risks) {
      const riskAnalysis = template.analysis_cache.risks
      const cachedRisks = Array.isArray(riskAnalysis) 
        ? riskAnalysis  // Fallback for old direct array format
        : riskAnalysis.risks || []  // New RiskAnalysis object format
      console.log('📥 Loading cached risks:', cachedRisks.length, 'risks')
      setTemplateRisks(cachedRisks)
    }
    
    // On mobile, switch to analysis view when template is selected
    if (window.innerWidth <= 768) {
      setMobileView('analysis')
    }
    
    console.log('🎯 Template selected - COMPLETE:', template.id)
  }, [selectedTemplate?.id]) // Only depend on the ID to prevent excessive re-renders

  // Debug duplicate keys
  useEffect(() => {
    const ids = toasts.map(t => t.id)
    const uniqueIds = new Set(ids)
    if (ids.length !== uniqueIds.size) {
      console.warn('🚨 Duplicate toast IDs detected:', ids)
      console.warn('🔍 Toasts array:', toasts)
    }
  }, [toasts])

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
      toast('Failed to load data', 'error')
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

  // Handle risks update from analysis component
  const handleRisksUpdate = useCallback((risks: any[]) => {
    setTemplateRisks(risks)
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
      // Clear risks cache when content changes as it may no longer be accurate
      setTemplateRisks([])
      toast('Template updated successfully', 'success')
    } catch (error) {
      console.error('Error updating template:', error)
      toast('Failed to update template', 'error')
    }
  }, [selectedTemplate, toast])

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
      toast('Template title updated', 'success')
    } catch (error) {
      console.error('❌ Failed to update template title:', error)
      toast('Failed to update title', 'error')
      
      // Revert on error
      setSelectedTemplate(prev => prev ? { ...prev, title: selectedTemplate.title } : null)
      setTemplates(prev => prev.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, title: selectedTemplate.title }
          : template
      ))
    }
  }, [selectedTemplate, toast])

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
            onToast={toast}
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
                  risks={templateRisks}
                  onContentChange={handleTemplateContentChange}
                  onRiskClick={(riskId) => {
                    // Switch to analysis view on mobile when risk is clicked
                    if (window.innerWidth <= 768) {
                      setMobileView('analysis')
                    }
                  }}
                  onHighlightClick={(riskId) => {
                    // Scroll to risk card in analysis panel
                    if (typeof window !== 'undefined' && (window as any).scrollToTemplateRiskCard) {
                      (window as any).scrollToTemplateRiskCard(riskId)
                    }
                    // Switch to analysis view on mobile when highlighted text is clicked
                    if (window.innerWidth <= 768) {
                      setMobileView('analysis')
                    }
                  }}
                  onComment={(text, position) => {
                    // Handle comment creation for templates
                    const comment = prompt(`Add comment for template: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"\n\nEnter your comment:`)
                    if (comment) {
                      toast(`Comment added: ${comment}`, 'success')
                    }
                  }}
                  onReanalyzeRisks={reanalyzeRisksRef.current}
                  onRegisterUpdateFunction={handleRegisterUpdateFunction}
                  className={styles.templateEditor}
                />
              </div>

              {/* Analysis Panel */}
              <div className={`${styles.analysisPanel} ${mobileView === 'analysis' ? styles.mobileVisible : styles.mobileHidden}`}>
                <TemplateAnalysis
                  template={selectedTemplate}
                  risks={templateRisks}
                  onRisksUpdate={handleRisksUpdate}
                  onTemplateUpdate={(updatedTemplate) => {
                    setSelectedTemplate(updatedTemplate)
                    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
                  }}
                  onToast={toast}
                />
              </div>
            </>
          ) : (
            <div className={styles.welcomeScreen}>
              <div className={styles.welcomeContent}>
                <div className={styles.welcomeIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <h2>Welcome to Template Manager</h2>
                <p>Select a template from the sidebar to begin analysis and version management.</p>
                
                {templates.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No templates found. Upload your first template from the sidebar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <Toast
          key={`${toast.id}-${index}`}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
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