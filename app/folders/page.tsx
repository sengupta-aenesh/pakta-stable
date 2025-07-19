'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Contract, contractsApi, Template, templatesApi, TemplateFolder, templateFoldersApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { Button, useToast, Toast, TopNavigation } from '@/components/ui'
import { foldersApi, Folder } from '@/lib/folders-api'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import ContractGrid from '@/components/folders/contract-grid'
import TemplateGrid from '@/components/folders/template-grid'
import StatsPanel from '@/components/folders/stats-panel'
import styles from './folders.module.css'

export default function FoldersPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateFolders, setTemplateFolders] = useState<TemplateFolder[]>([])
  const [selectedTemplateFolder, setSelectedTemplateFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'contracts' | 'templates'>('contracts')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast, toasts, removeToast } = useToast()

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
        loadContracts(currentUser.id),
        loadFolders(currentUser.id),
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

  async function loadContracts(userId: string) {
    const userContracts = await contractsApi.getAll(userId)
    setContracts(userContracts)
  }

  async function loadFolders(userId: string) {
    try {
      const userFolders = await foldersApi.getAll(userId)
      setFolders(userFolders)
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  async function loadTemplates(userId: string) {
    try {
      const userTemplates = await templatesApi.getAll(userId)
      setTemplates(userTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
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

  async function handleContractClick(contract: Contract) {
    // Navigate to contract centre with contract ID as query parameter
    router.push(`/dashboard?contractId=${contract.id}`)
  }

  async function handleTemplateClick(template: Template) {
    // Navigate to template dashboard with template ID as query parameter
    router.push(`/template-dashboard?templateId=${template.id}`)
  }

  function handleUploadToFolder(folderId: string | null) {
    // Trigger the upload input in the sidebar
    const uploadInput = document.getElementById('contract-upload') as HTMLInputElement
    if (uploadInput) {
      uploadInput.click()
    }
  }


  // Filter data based on current view mode and selected folder
  const filteredContracts = selectedFolder 
    ? contracts.filter(contract => contract.folder_id === selectedFolder)
    : contracts // Show ALL contracts when no folder is selected

  const filteredTemplates = selectedTemplateFolder 
    ? templates.filter(template => template.folder_id === selectedTemplateFolder)
    : templates // Show ALL templates when no template folder is selected

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
      <TopNavigation currentPage="folders" />

      {/* Left Sidebar - Folder Tree */}
      <div>
        <UnifiedSidebar
          folders={folders}
          contracts={contracts}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onFoldersUpdate={() => loadFolders(user.id)}
          onContractsUpdate={() => loadContracts(user.id)}
          onContractClick={handleContractClick}
          // Template props
          templateFolders={templateFolders}
          templates={templates}
          selectedTemplateFolder={selectedTemplateFolder}
          onSelectTemplateFolder={setSelectedTemplateFolder}
          onTemplateFoldersUpdate={() => loadTemplateFolders(user.id)}
          onTemplatesUpdate={() => loadTemplates(user.id)}
          onTemplateClick={handleTemplateClick}
          // Common props
          user={user}
          showUserSection={true}
          onSignOut={handleSignOut}
          onToast={toast}
          // View mode
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Main Content - Contract or Template Grid */}
      <div className={styles.mainContent}>
        {viewMode === 'contracts' ? (
          <ContractGrid
            contracts={filteredContracts}
            selectedFolder={selectedFolder}
            folders={folders}
            onContractClick={handleContractClick}
            onContractsUpdate={() => loadContracts(user.id)}
            onUploadToFolder={handleUploadToFolder}
            onFolderClick={setSelectedFolder}
            onBackToAll={() => setSelectedFolder(null)}
          />
        ) : (
          <TemplateGrid
            templates={filteredTemplates}
            selectedTemplateFolder={selectedTemplateFolder}
            templateFolders={templateFolders}
            onTemplateClick={handleTemplateClick}
            onTemplatesUpdate={() => loadTemplates(user.id)}
            onUploadToFolder={(folderId) => {
              // Handle template upload to folder - for future implementation
              console.log('Template upload to folder:', folderId)
            }}
            onFolderClick={setSelectedTemplateFolder}
            onBackToAll={() => setSelectedTemplateFolder(null)}
          />
        )}
      </div>

      {/* Right Panel - Stats */}
      <div className={styles.statsPanel}>
        <StatsPanel
          contracts={contracts}
          folders={folders}
          user={user}
        />
      </div>

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