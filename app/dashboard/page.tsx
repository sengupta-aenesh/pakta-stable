'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Make this page dynamic to avoid Suspense issues
export const dynamic = 'force-dynamic'
import { Contract, contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { foldersApi, Folder } from '@/lib/folders-api'
import ContractList from '@/components/contracts/contract-list'
import ContractEditor from '@/components/contracts/contract-editor'
import InteractiveContractEditor from '@/components/contracts/interactive-contract-editor'
import { ContractAnalysis } from '@/components/contracts/contract-analysis'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import TrialStatus from '@/components/subscription/trial-status'
import { Button, TopNavigation } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import styles from './dashboard.module.css'

type MobileView = 'list' | 'editor' | 'analysis'

function DashboardContent() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [contractRisks, setContractRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const reanalyzeRisksRef = useRef<(() => Promise<void>) | null>(null)
  const [updateContractContentFunction, setUpdateContractContentFunction] = useState<((content: string | null) => void) | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const notifications = useEnhancedNotifications()
  const { notify } = notifications

  // Stable callback for registering update function to prevent infinite loops
  const handleRegisterUpdateFunction = useCallback((fn: (content: string | null) => void) => {
    setUpdateContractContentFunction(() => fn)
  }, [])

  // Stable callback for registering reanalysis function using ref to avoid state updates during render
  const handleRegisterReanalysisFunction = useCallback((fn: () => Promise<void>) => {
    reanalyzeRisksRef.current = fn
  }, [])

  // Contract selection handler - optimized to prevent cascading re-renders
  const handleContractSelect = useCallback(async (contract: Contract, fromURL = false) => {
    // Prevent unnecessary re-selection of the same contract
    if (selectedContract?.id === contract.id) {
      console.log('✅ Contract already selected, skipping re-selection:', contract.id)
      return
    }
    
    console.log('🎯 Contract selected - START:', {
      contractId: contract.id,
      contractTitle: contract.title,
      source: fromURL ? 'URL' : 'sidebar',
      currentSelected: selectedContract?.id || 'none'
    })
    
    // Clear previous contract data immediately to prevent conflicts
    setContractRisks([])
    
    // Only update URL if this is a manual selection (not from URL monitoring)
    if (!fromURL) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('contractId', contract.id)
      window.history.pushState({}, '', newUrl.toString())
    }
    
    // Set the new contract
    setSelectedContract(contract)
    
    // Load cached risks from RiskAnalysis object
    if (contract.analysis_cache?.risks) {
      const riskAnalysis = contract.analysis_cache.risks
      const cachedRisks = Array.isArray(riskAnalysis) 
        ? riskAnalysis  // Fallback for old direct array format
        : riskAnalysis.risks || []  // New RiskAnalysis object format
      console.log('📥 Loading cached risks:', cachedRisks.length, 'risks')
      setContractRisks(cachedRisks)
    }
    
    // On mobile, switch to analysis view when contract is selected
    if (window.innerWidth <= 768) {
      setMobileView('analysis')
    }
    
    console.log('🎯 Contract selected - COMPLETE:', contract.id)
  }, [selectedContract?.id]) // Only depend on the ID to prevent excessive re-renders

  // Debug code removed - using notification system now

  useEffect(() => {
    loadUserAndContracts()
  }, [])

  // Handle URL contract selection when contracts are available or URL changes
  useEffect(() => {
    const contractId = searchParams.get('contractId')
    console.log('🔍 URL contract selection check:', {
      contractId,
      contractsLoaded: contracts.length,
      currentlySelected: selectedContract?.id || 'none',
      urlVsSelected: contractId !== selectedContract?.id ? 'MISMATCH' : 'match'
    })
    
    if (contractId && contracts.length > 0) {
      // Only load from URL if there's a mismatch (prevents unnecessary re-loads)
      if (selectedContract?.id !== contractId) {
        const targetContract = contracts.find(contract => contract.id === contractId)
        if (targetContract) {
          console.log('🔗 Loading contract from URL parameter (URL differs from current selection):', {
            contractId,
            contractTitle: targetContract.title,
            previousSelection: selectedContract?.id || 'none'
          })
          // Use handleContractSelect with fromURL flag to prevent URL update loops
          handleContractSelect(targetContract, true)
        } else {
          console.log('❌ Contract not found in contracts list for ID:', contractId)
          console.log('Available contract IDs:', contracts.map(c => c.id))
        }
      } else {
        console.log('✅ URL and selected contract already match - no action needed')
      }
    } else if (!contractId && selectedContract) {
      // Clear selection if no contract ID in URL
      console.log('🧹 Clearing contract selection (no URL parameter)')
      setSelectedContract(null)
      setContractRisks([])
    }
  }, [searchParams, contracts, selectedContract?.id]) // PERFORMANCE FIX: Use selectedContract.id instead of handleContractSelect to prevent infinite loops

  // Removed debug logging to improve performance during contract switching

  // Expose update contract content function globally
  useEffect(() => {
    if (updateContractContentFunction) {
      (window as any).updateContractContent = updateContractContentFunction
    }
  }, [updateContractContentFunction])

  async function loadUserAndContracts() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      const [userContracts, userFolders] = await Promise.all([
        contractsApi.getAll(currentUser.id),
        foldersApi.getAll(currentUser.id)
      ])
      setContracts(userContracts)
      setFolders(userFolders)
      
      // Auto-select contract if contractId is provided in URL
      const contractId = searchParams.get('contractId')
      if (contractId && userContracts.length > 0) {
        const targetContract = userContracts.find(contract => contract.id === contractId)
        if (targetContract) {
          console.log('🎯 Auto-selecting contract from URL:', {
            contractId,
            contractTitle: targetContract.title,
            hasContent: !!targetContract.content
          })
          // Use the same logic as manual selection to ensure proper loading
          handleContractSelect(targetContract, true)
        } else {
          console.log('⚠️ Contract not found for ID:', contractId)
        }
      }
    } catch (error) {
      console.error('Error loading contracts:', error)
      notifications.error('Operation Failed', 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    const { signOut } = await import('@/lib/auth-client')
    await signOut()
    router.push('/auth/login')
  }

  async function handleContractUpdate() {
    if (user) {
      const updatedContracts = await contractsApi.getAll(user.id)
      setContracts(updatedContracts)
      notifications.success('Success', 'Contract updated successfully')
    }
  }


  async function handleContractContentChange(content: string | null) {
    if (!selectedContract) return
    
    const safeContent = content || ''
    console.log('📝 handleContractContentChange called:', { 
      contentLength: safeContent.length, 
      contractId: selectedContract.id,
      wasNull: content === null
    })
    
    try {
      await contractsApi.update(selectedContract.id, { content: safeContent })
      // Update the local contract state
      setSelectedContract(prev => prev ? { ...prev, content: safeContent } : null)
      // Clear risks cache when content changes as it may no longer be accurate
      setContractRisks([])
      notifications.success('Success', 'Contract updated successfully')
    } catch (error) {
      console.error('Error updating contract:', error)
      notifications.error('Operation Failed', 'Failed to update contract')
    }
  }

  const handleFoldersUpdate = useCallback(async () => {
    if (user) {
      const userFolders = await foldersApi.getAll(user.id)
      setFolders(userFolders)
    }
  }, [user])

  const handleContractsUpdate = useCallback(async () => {
    if (user) {
      const userContracts = await contractsApi.getAll(user.id)
      setContracts(userContracts)
    }
  }, [user])

  // Function to refresh current contract data (for analysis completion)
  const refreshCurrentContract = useCallback(async () => {
    if (user && selectedContract) {
      console.log('🔄 Refreshing current contract data...')
      try {
        const updatedContract = await contractsApi.getById(selectedContract.id)
        if (updatedContract) {
          setSelectedContract(updatedContract)
          
          // Also update in the contracts array
          setContracts(prev => prev.map(contract => 
            contract.id === updatedContract.id ? updatedContract : contract
          ))
          
          console.log('✅ Contract data refreshed successfully')
        }
      } catch (error) {
        console.error('❌ Failed to refresh contract data:', error)
      }
    }
  }, [user, selectedContract])

  // Expose refresh function globally for analysis component
  useEffect(() => {
    (window as any).refreshCurrentContract = refreshCurrentContract
  }, [refreshCurrentContract])

  // Handle contract title update with automatic saving
  const handleContractTitleChange = useCallback(async (newTitle: string) => {
    if (!selectedContract || !newTitle.trim()) return
    
    const trimmedTitle = newTitle.trim()
    
    // Update local state immediately for responsive UI
    setSelectedContract(prev => prev ? { ...prev, title: trimmedTitle } : null)
    
    // Update in contracts array as well
    setContracts(prev => prev.map(contract => 
      contract.id === selectedContract.id 
        ? { ...contract, title: trimmedTitle }
        : contract
    ))
    
    try {
      // Save to database
      await contractsApi.update(selectedContract.id, { title: trimmedTitle })
      console.log('✅ Contract title updated successfully:', trimmedTitle)
      notifications.success('Success', 'Contract title updated')
    } catch (error) {
      console.error('❌ Failed to update contract title:', error)
      notifications.error('Operation Failed', 'Failed to update title')
      
      // Revert on error
      setSelectedContract(prev => prev ? { ...prev, title: selectedContract.title } : null)
      setContracts(prev => prev.map(contract => 
        contract.id === selectedContract.id 
          ? { ...contract, title: selectedContract.title }
          : contract
      ))
    }
  }, [selectedContract])

  // Debounced title saving to avoid saving on every keystroke
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectedContractRef = useRef<Contract | null>(null)
  
  // Keep ref in sync with selectedContract
  useEffect(() => {
    selectedContractRef.current = selectedContract
  }, [selectedContract])
  
  const handleTitleInputChange = useCallback((newTitle: string) => {
    console.log('📝 handleTitleInputChange called with:', newTitle)
    
    const currentContract = selectedContractRef.current
    if (!currentContract) {
      console.log('❌ No selected contract for title change')
      return
    }
    
    console.log('🔄 Updating title from', currentContract.title, 'to', newTitle)
    
    // Update local state immediately for responsive UI
    setSelectedContract(prev => {
      if (!prev) return null
      const updated = { ...prev, title: newTitle }
      console.log('✅ Updated selectedContract title:', updated.title)
      return updated
    })
    
    // Also update in contracts array immediately
    setContracts(prev => prev.map(contract => 
      contract.id === currentContract.id 
        ? { ...contract, title: newTitle }
        : contract
    ))
    
    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current)
    }
    
    // Set new timeout to save after user stops typing
    titleSaveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-saving title after timeout:', newTitle)
      handleContractTitleChange(newTitle)
    }, 1000) // Save 1 second after user stops typing
  }, [handleContractTitleChange])

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
      {/* iOS-Style Top Navigation with Contract Title */}
      <TopNavigation 
        currentPage="analysis"
        contractTitle={selectedContract?.title || ''}
        onContractTitleChange={selectedContract ? handleTitleInputChange : undefined}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Trial Status - only render container if needed */}
      <TrialStatus />

      {/* Main Container with Sidebar and Content */}
      <div className={styles.mainContainer}>
        {/* Left Sidebar */}
        <div className={mobileView === 'list' ? styles.mobileVisible : styles.mobileHidden}>
          <UnifiedSidebar
            folders={folders}
            contracts={contracts}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            onFoldersUpdate={handleFoldersUpdate}
            onContractsUpdate={handleContractsUpdate}
            onContractClick={handleContractSelect}
            user={user}
            showUserSection={false}
            // Notification system is used internally
            // Force contracts view mode - no templates in dashboard
            viewMode="contracts"
            onViewModeChange={() => {}} // Disable view mode switching
          />
        </div>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* Editor Panel */}
          <div className={`${styles.editorPanel} ${mobileView === 'editor' ? styles.mobileVisible : styles.mobileHidden}`}>
            <InteractiveContractEditor
              contract={selectedContract}
              risks={contractRisks}
              onContentChange={handleContractContentChange}
              onRiskClick={(riskId) => {
                // Switch to analysis view on mobile when risk is clicked
                if (window.innerWidth <= 768) {
                  setMobileView('analysis')
                }
              }}
              onHighlightClick={(riskId) => {
                // Scroll to risk card in analysis panel
                if (typeof window !== 'undefined' && (window as any).scrollToRiskCard) {
                  (window as any).scrollToRiskCard(riskId)
                }
                // Switch to analysis view on mobile when highlighted text is clicked
                if (window.innerWidth <= 768) {
                  setMobileView('analysis')
                }
              }}
              onComment={(text, position) => {
                // Handle comment creation
                // For now, we'll just show an alert (you can enhance this with a proper comment system later)
                const comment = prompt(`Add comment for: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"\n\nEnter your comment:`)
                if (comment) {
                  notifications.success('Success', `Comment added: ${comment}`)
                }
              }}
              onReanalyzeRisks={reanalyzeRisksRef.current}
              onRegisterUpdateFunction={handleRegisterUpdateFunction}
              className={styles.contractEditor}
            />
          </div>

          {/* Analysis Panel */}
          <div className={`${styles.analysisPanel} ${mobileView === 'analysis' ? styles.mobileVisible : styles.mobileHidden}`}>
            <ContractAnalysis 
              contract={selectedContract} 
              onMobileViewChange={setMobileView}
              mobileView={mobileView}
              onRisksUpdate={setContractRisks}
              onReanalysisRequest={handleRegisterReanalysisFunction}
              onContractUpdate={handleContractContentChange}
            />
          </div>
        </div>
      </div>

      {/* Toasts are now handled by the notification system */}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}