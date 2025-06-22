'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Contract, contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { Button, useToast, Toast, TopNavigation } from '@/components/ui'
import { foldersApi, Folder } from '@/lib/folders-api'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import ContractGrid from '@/components/folders/contract-grid'
import StatsPanel from '@/components/folders/stats-panel'
import styles from './folders.module.css'

export default function FoldersPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
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
        loadFolders(currentUser.id)
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

  async function handleSignOut() {
    const { signOut } = await import('@/lib/auth-client')
    await signOut()
    router.push('/auth/login')
  }

  async function handleContractClick(contract: Contract) {
    // Navigate to contract centre with contract ID as query parameter
    router.push(`/dashboard?contractId=${contract.id}`)
  }

  function handleUploadToFolder(folderId: string | null) {
    // Trigger the upload input in the sidebar
    const uploadInput = document.getElementById('contract-upload') as HTMLInputElement
    if (uploadInput) {
      uploadInput.click()
    }
  }


  const filteredContracts = selectedFolder 
    ? contracts.filter(contract => contract.folder_id === selectedFolder)
    : contracts // Show ALL contracts when no folder is selected

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
          user={user}
          showUserSection={true}
          onSignOut={handleSignOut}
          onToast={toast}
        />
      </div>

      {/* Main Content - Contract Grid */}
      <div className={styles.mainContent}>
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