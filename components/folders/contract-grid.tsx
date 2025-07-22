'use client'

import { useState } from 'react'
import { Contract, contractsApi } from '@/lib/supabase-client'
import { Button, ConfirmationDialog } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import ContextMenu from './context-menu'
import FolderSelectionModal from './folder-selection-modal'
import RenameModal from './rename-modal'
import styles from '@/app/folders/folders.module.css'

interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

interface ContractGridProps {
  contracts: Contract[]
  selectedFolder: string | null
  folders: Folder[]
  onContractClick: (contract: Contract) => void
  onContractsUpdate: () => void
  onUploadToFolder?: (folderId: string | null) => void
  onFolderClick?: (folderId: string) => void
  onBackToAll?: () => void
  onNewFolder?: () => void
}

export default function ContractGrid({
  contracts,
  selectedFolder,
  folders,
  onContractClick,
  onContractsUpdate,
  onUploadToFolder,
  onFolderClick,
  onBackToAll,
  onNewFolder
}: ContractGridProps) {
  const notifications = useEnhancedNotifications()
  const { notify } = notifications
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [modalState, setModalState] = useState<{
    type: 'move' | 'copy' | 'rename' | 'delete' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    contract: Contract | null
  }>({ isOpen: false, contract: null })
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    contract: Contract | null
  }>({ isOpen: false, position: { x: 0, y: 0 }, contract: null })
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDisplayTitle = () => {
    if (selectedFolder) {
      const folder = folders.find(f => f.id === selectedFolder)
      return folder ? folder.name : 'Unknown Folder'
    }
    return 'All Contracts'
  }

  const getDisplaySubtitle = () => {
    const contractCount = contracts.length
    const folderCount = selectedFolder ? 0 : folders.length
    
    if (selectedFolder) {
      return `${contractCount} ${contractCount === 1 ? 'contract' : 'contracts'} in this folder`
    }
    
    const totalItems = contractCount + folderCount
    if (totalItems === 0) return 'No items'
    
    const parts = []
    if (folderCount > 0) parts.push(`${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}`)
    if (contractCount > 0) parts.push(`${contractCount} ${contractCount === 1 ? 'contract' : 'contracts'}`)
    
    return parts.join(', ')
  }
  
  const getFolderForContract = (contract: Contract) => {
    if (!contract.folder_id) return null
    return folders.find(f => f.id === contract.folder_id)
  }

  // Handle contract actions
  const handleMove = async (folderId: string | null) => {
    if (!selectedContract) return
    
    try {
      await contractsApi.update(selectedContract.id, { folder_id: folderId })
      notifications.success('File Moved', 'Contract moved successfully')
      onContractsUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedContract(null)
    } catch (error) {
      console.error('Error moving contract:', error)
      notifications.error('Operation Failed', 'Failed to move contract')
    }
  }

  const handleCopy = async (folderId: string | null) => {
    if (!selectedContract) return
    
    try {
      const newContract = {
        user_id: selectedContract.user_id,
        title: `${selectedContract.title} (Copy)`,
        content: selectedContract.content,
        upload_url: selectedContract.upload_url,
        file_key: selectedContract.file_key,
        folder_id: folderId,
        analysis_cache: selectedContract.analysis_cache,
        analysis_status: selectedContract.analysis_status,
        analysis_progress: selectedContract.analysis_progress
      }
      
      await contractsApi.create(newContract)
      notifications.success('Success', 'Contract copied successfully')
      onContractsUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedContract(null)
    } catch (error) {
      console.error('Error copying contract:', error)
      notifications.error('Operation Failed', 'Failed to copy contract')
    }
  }

  const handleRename = async (newName: string) => {
    if (!selectedContract) return
    
    try {
      await contractsApi.update(selectedContract.id, { title: newName })
      notifications.success('Success', 'Contract renamed successfully')
      onContractsUpdate()
      setModalState({ type: null, isOpen: false })
      setSelectedContract(null)
    } catch (error) {
      console.error('Error renaming contract:', error)
      notifications.error('Operation Failed', 'Failed to rename contract')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmation.contract) return
    
    try {
      await contractsApi.delete(deleteConfirmation.contract.id)
      notifications.success('File Deleted', 'Contract deleted successfully')
      onContractsUpdate()
      setDeleteConfirmation({ isOpen: false, contract: null })
    } catch (error) {
      console.error('Error deleting contract:', error)
      notifications.error('Operation Failed', 'Failed to delete contract')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, contract: Contract) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      contract
    })
    setSelectedContract(contract)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={styles.gridHeader}>
        {selectedFolder && onBackToAll ? (
          <div className={styles.headerWithBack}>
            <button 
              className={styles.backButton}
              onClick={onBackToAll}
              title="Back to All Contracts"
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
          {onNewFolder && !selectedFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewFolder}
              className={styles.actionButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <path d="M12 11v6m3-3h-6"/>
              </svg>
              <span>New Folder</span>
            </Button>
          )}
          {onUploadToFolder && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onUploadToFolder(selectedFolder)}
              className={styles.actionButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Upload Contract</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contract Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className={styles.contractGrid}>
        {contracts.length === 0 && (selectedFolder || folders.length === 0) ? (
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
                {selectedFolder ? 'No contracts in this folder' : 'No contracts yet'}
              </h3>
              <p className={styles.emptyStateDescription}>
                {selectedFolder 
                  ? 'Upload contracts directly to this folder or drag existing contracts here from other folders.'
                  : 'Upload your first contract to get started with AI-powered analysis and organization.'
                }
              </p>
              {onUploadToFolder && (
                <button
                  onClick={() => onUploadToFolder(selectedFolder)}
                  className={styles.emptyStateButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Upload Contract
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Show folders in All Contracts view - OS Style */}
            {!selectedFolder && folders.map((folder) => {
              const folderContractCount = contracts.filter(c => c.folder_id === folder.id).length
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
                    {folderContractCount} {folderContractCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
              )
            })}
            
            {/* Show contracts - OS Style */}
            {contracts.map((contract) => {
              const contractFolder = getFolderForContract(contract)
              return (
                <div
                  key={contract.id}
                  className={styles.osFileItem}
                  onClick={() => onContractClick(contract)}
                  onContextMenu={(e) => handleContextMenu(e, contract)}
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
                  
                  {/* Document Name */}
                  <div className={styles.osFileName}>
                    {contract.title}
                  </div>
                  
                  {/* Document Meta Info */}
                  <div className={styles.osFileMeta}>
                    {contractFolder ? (
                      <span>{contractFolder.name}</span>
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
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, contract: null })}
        onMove={() => {
          setModalState({ type: 'move', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, contract: null })
        }}
        onCopy={() => {
          setModalState({ type: 'copy', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, contract: null })
        }}
        onRename={() => {
          setModalState({ type: 'rename', isOpen: true })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, contract: null })
        }}
        onDelete={() => {
          setDeleteConfirmation({ isOpen: true, contract: contextMenu.contract })
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, contract: null })
        }}
      />

      {/* Modals */}
      {modalState.type === 'move' && selectedContract && (
        <FolderSelectionModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedContract(null)
          }}
          onSelect={handleMove}
          folders={folders}
          title="Move Contract"
          currentFolderId={selectedContract.folder_id}
          fileType="contract"
        />
      )}

      {modalState.type === 'copy' && selectedContract && (
        <FolderSelectionModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedContract(null)
          }}
          onSelect={handleCopy}
          folders={folders}
          title="Copy Contract"
          currentFolderId={selectedContract.folder_id}
          fileType="contract"
        />
      )}

      {modalState.type === 'rename' && selectedContract && (
        <RenameModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ type: null, isOpen: false })
            setSelectedContract(null)
          }}
          onRename={handleRename}
          currentName={selectedContract.title}
          itemType="contract"
        />
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, contract: null })}
        onConfirm={handleDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete "${deleteConfirmation.contract?.title}"? This action cannot be undone.`}
        type="danger"
      />

      {/* Render toasts */}
      {/* Toasts are now handled by the notification system */}
    </div>
  )
}