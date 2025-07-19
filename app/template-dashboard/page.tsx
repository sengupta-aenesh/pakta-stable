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

  // Mobile view handlers
  const handleMobileViewChange = (view: MobileView) => {
    setMobileView(view)
  }

  const handleBackToList = () => {
    setMobileView('list')
  }

  // Handle risks update from analysis component
  const handleRisksUpdate = useCallback((risks: any[]) => {
    setTemplateRisks(risks)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* iOS-Style Top Navigation */}
      <TopNavigation currentPage="template-dashboard" />

      {/* Left Sidebar - Template Tree */}
      <div className={`${styles.sidebar} ${mobileView !== 'list' ? styles.hiddenMobile : ''}`}>
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
          showUserSection={true}
          onSignOut={handleSignOut}
          onToast={toast}
          // View mode - force templates
          viewMode="templates"
          onViewModeChange={() => {}} // No switching in template dashboard
        />
      </div>

      {/* Main Content Area */}
      <div className={`${styles.mainContent} ${mobileView === 'list' ? styles.hiddenMobile : ''}`}>
        {selectedTemplate ? (
          <>
            {/* Template Editor */}
            <div className={`${styles.editorSection} ${mobileView === 'analysis' ? styles.hiddenMobile : ''}`}>
              <InteractiveTemplateEditor
                template={selectedTemplate}
                onTemplateUpdate={(updatedTemplate) => {
                  setSelectedTemplate(updatedTemplate)
                  // Update the template in the list
                  setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
                }}
                onRegisterUpdateFunction={handleRegisterUpdateFunction}
                onRegisterReanalysisFunction={handleRegisterReanalysisFunction}
                onRisksUpdate={handleRisksUpdate}
                onToast={toast}
              />
            </div>

            {/* Template Analysis */}
            <div className={`${styles.analysisSection} ${mobileView === 'editor' ? styles.hiddenMobile : ''}`}>
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

      {/* Mobile Navigation */}
      <div className={styles.mobileNav}>
        <button
          className={`${styles.mobileNavBtn} ${mobileView === 'list' ? styles.active : ''}`}
          onClick={() => handleMobileViewChange('list')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          Templates
        </button>
        
        {selectedTemplate && (
          <>
            <button
              className={`${styles.mobileNavBtn} ${mobileView === 'editor' ? styles.active : ''}`}
              onClick={() => handleMobileViewChange('editor')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Editor
            </button>
            
            <button
              className={`${styles.mobileNavBtn} ${mobileView === 'analysis' ? styles.active : ''}`}
              onClick={() => handleMobileViewChange('analysis')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                <path d="M9 7v10"></path>
                <path d="M13 7h2a2 2 0 0 1 2 2v1"></path>
              </svg>
              Analysis
            </button>
          </>
        )}
      </div>

      {/* Trial Status */}
      <TrialStatus />

      {/* Render toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
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