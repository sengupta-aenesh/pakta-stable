'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmationDialog } from '@/components/ui'
import { foldersApi, Folder } from '@/lib/folders-api'
import { Contract, contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import mammoth from 'mammoth'
import styles from '@/app/folders/folders.module.css'

interface UnifiedSidebarProps {
  folders: Folder[]
  contracts: Contract[]
  selectedFolder: string | null
  onSelectFolder: (folderId: string | null) => void
  onFoldersUpdate: () => void
  onContractsUpdate: () => void
  onContractClick: (contract: Contract) => void
  user: any
  showUserSection?: boolean
  onSignOut?: () => void
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

interface FolderTreeItem extends Folder {
  children: FolderTreeItem[]
  contractCount: number
  isExpanded: boolean
}

export default function UnifiedSidebar({
  folders,
  contracts,
  selectedFolder,
  onSelectFolder,
  onFoldersUpdate,
  onContractsUpdate,
  onContractClick,
  user,
  showUserSection = false,
  onSignOut,
  onToast
}: UnifiedSidebarProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [draggedContract, setDraggedContract] = useState<Contract | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  })

  // Global drag event handlers to prevent cancellation
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault() // Allow drop targets
    }
    
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault()
    }
    
    if (isDragging) {
      document.addEventListener('dragover', handleGlobalDragOver)
      document.addEventListener('dragenter', handleGlobalDragEnter)
    }
    
    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver)
      document.removeEventListener('dragenter', handleGlobalDragEnter)
    }
  }, [isDragging])

  // Build folder tree
  const buildFolderTree = (): FolderTreeItem[] => {
    const folderMap = new Map<string, FolderTreeItem>()
    
    // Initialize all folders
    folders.forEach(folder => {
      const contractCount = contracts.filter(contract => contract.folder_id === folder.id).length
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        contractCount,
        isExpanded: expandedFolders.has(folder.id)
      })
    })

    // Build tree structure
    const rootFolders: FolderTreeItem[] = []
    folders.forEach(folder => {
      const folderItem = folderMap.get(folder.id)!
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id)!.children.push(folderItem)
      } else {
        rootFolders.push(folderItem)
      }
    })

    return rootFolders
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = async () => {
    if (!user) return
    setCreatingFolder(true)
    setNewFolderName('New Folder')
  }

  const handleCreateFolderSubmit = async () => {
    if (!user || !newFolderName.trim()) {
      setCreatingFolder(false)
      setNewFolderName('')
      return
    }
    
    try {
      await foldersApi.create({
        user_id: user.id,
        name: newFolderName.trim(),
        parent_id: selectedFolder || null
      })
      setCreatingFolder(false)
      setNewFolderName('')
      onFoldersUpdate()
      onToast?.('Folder created successfully!', 'success')
    } catch (error) {
      console.error('Failed to create folder:', error)
      onToast?.('Failed to create folder. Please try again.', 'error')
      setCreatingFolder(false)
      setNewFolderName('')
    }
  }

  const handleEditFolder = (folder: FolderTreeItem) => {
    setEditingFolder(folder.id)
    setEditingName(folder.name)
  }

  const handleSaveEdit = async () => {
    if (!editingFolder || !editingName.trim()) return
    
    try {
      await foldersApi.update(editingFolder, { name: editingName.trim() })
      setEditingFolder(null)
      setEditingName('')
      onFoldersUpdate()
      onToast?.('Folder renamed successfully!', 'success')
    } catch (error) {
      console.error('Failed to update folder:', error)
      onToast?.('Failed to rename folder. Please try again.', 'error')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'edit') => {
    if (e.key === 'Enter') {
      if (action === 'create') {
        handleCreateFolderSubmit()
      } else {
        handleSaveEdit()
      }
    } else if (e.key === 'Escape') {
      if (action === 'create') {
        setCreatingFolder(false)
        setNewFolderName('')
      } else {
        setEditingFolder(null)
        setEditingName('')
      }
    }
  }

  // Simple drag and drop handlers
  const handleContractDragStart = (e: React.DragEvent, contract: Contract) => {
    console.log('🎯 Drag Start:', contract.title)
    
    // Set drag data immediately
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', contract.id)
    
    // Simple state updates with delay to prevent cancellation
    setTimeout(() => {
      setDraggedContract(contract)
      setIsDragging(true)
    }, 50)
  }

  const handleContractDragEnd = (e: React.DragEvent) => {
    console.log('🏁 Drag End')
    setDraggedContract(null)
    setDragOverFolder(null)
    setIsDragging(false)
  }

  const handleFolderDragOver = (e: React.DragEvent, folderId: string | null) => {
    // Always prevent default to allow drop
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📁 Drag Over Folder:', folderId, 'draggedContract:', !!draggedContract)
    
    // If we don't have a dragged contract from state, try to get it from drag data
    let draggedContractData = draggedContract
    if (!draggedContractData) {
      // Try multiple data formats
      let dragData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-contract-id')
      if (!dragData) {
        console.log('❌ No drag data found in either format')
        return
      }
      
      draggedContractData = contracts.find(c => c.id === dragData)
      if (!draggedContractData) {
        console.log('❌ Contract not found for ID:', dragData)
        return
      }
      console.log('📋 Retrieved contract from drag data:', draggedContractData.title)
    }
    
    // Prevent dropping into "All Contracts" (folderId === null)
    if (folderId === null) {
      e.dataTransfer.dropEffect = 'none'
      console.log('🚫 Cannot drop into All Contracts')
      return
    }
    
    // Prevent dropping into the same folder the contract is already in
    if (draggedContractData.folder_id === folderId) {
      e.dataTransfer.dropEffect = 'none'
      console.log('🚫 Contract already in this folder')
      return
    }
    
    e.dataTransfer.dropEffect = 'move'
    
    // Set the drag over folder if it's different
    if (dragOverFolder !== folderId) {
      setDragOverFolder(folderId)
      console.log('✅ Valid drop target:', folderId)
    }
  }

  const handleFolderDragEnter = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('📂 Drag Enter Folder:', folderId)
  }

  const handleFolderDragLeave = (e: React.DragEvent, folderId: string | null) => {
    // Only clear if we're actually leaving this specific folder
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    // Check if the mouse is still within the folder bounds
    const isStillInside = (
      x >= rect.left && x <= rect.right &&
      y >= rect.top && y <= rect.bottom
    )
    
    if (!isStillInside && dragOverFolder === folderId) {
      setDragOverFolder(null)
      console.log('📤 Drag Leave Folder:', folderId || 'All Contracts')
    }
  }

  const handleFolderDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🎯 Drop event fired on folder:', folderId)
    
    // Get the contract - prefer state first, then drag data
    let draggedContractData = draggedContract
    if (!draggedContractData) {
      // Get the contract ID from drag data
      const dragData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-contract-id')
      if (!dragData) {
        console.log('❌ No drag data in drop event')
        return
      }
      
      // Find the contract being dragged
      draggedContractData = contracts.find(c => c.id === dragData)
      if (!draggedContractData) {
        console.log('❌ Contract not found for ID:', dragData)
        return
      }
      console.log('📋 Retrieved contract from drag data in drop:', draggedContractData.title)
    }
    
    // Prevent dropping into "All Contracts" (folderId === null)
    if (folderId === null) {
      console.log('🚫 Cannot drop into All Contracts section')
      setDragOverFolder(null)
      setIsDragging(false)
      onToast?.('Cannot move contracts to "All Contracts" section', 'error')
      return
    }
    
    // Prevent dropping on the same folder
    if (draggedContractData.folder_id === folderId) {
      console.log('ℹ️ Contract already in this folder')
      setDragOverFolder(null)
      setIsDragging(false)
      setDraggedContract(null)
      onToast?.('Contract is already in this folder', 'info')
      return
    }
    
    const targetFolderName = folderId ? folders.find(f => f.id === folderId)?.name || 'folder' : 'All Contracts'
    
    console.log('🎯 Drag & Drop - Starting drop operation:', {
      contractId: draggedContractData.id,
      contractTitle: draggedContractData.title,
      fromFolder: draggedContractData.folder_id || 'All Contracts',
      targetFolderId: folderId,
      targetFolderName
    })
    
    // Clear drag states immediately for responsive UI
    setDragOverFolder(null)
    setIsDragging(false)
    
    try {
      console.log('📡 Drag & Drop - Making API call to update contract')
      await contractsApi.update(draggedContractData.id, { folder_id: folderId })
      console.log('✅ Drag & Drop - API call successful')
      
      onContractsUpdate()
      setDraggedContract(null)
      
      console.log('🎉 Drag & Drop - Operation completed successfully')
      onToast?.(`"${draggedContractData.title}" moved to ${targetFolderName}`, 'success')
    } catch (error) {
      console.error('❌ Drag & Drop - Failed to move contract:', error)
      console.error('Error details:', {
        contractId: draggedContractData.id,
        targetFolderId: folderId,
        errorMessage: error.message || 'Unknown error'
      })
      onToast?.('Failed to move contract. Please try again.', 'error')
      setDraggedContract(null)
    }
  }

  // File upload functionality
  async function extractTextFromDocx(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('Error extracting text:', error)
      throw error
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📁 File Upload - Starting upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      selectedFolder: selectedFolder
    })

    try {
      setUploading(true)
      
      console.log('📄 File Upload - Extracting text from docx file')
      // Extract text from docx
      const extractedText = await extractTextFromDocx(file)
      console.log('✅ File Upload - Text extraction successful, length:', extractedText.length)
      
      // Extract title from filename
      const title = file.name.replace('.docx', '')
      console.log('📝 File Upload - Extracted title:', title)
      
      // Get current user
      console.log('👤 File Upload - Getting current user')
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.error('❌ File Upload - User not authenticated')
        throw new Error('User not authenticated')
      }
      console.log('✅ File Upload - User authenticated:', currentUser.email)
      
      console.log('💾 File Upload - Saving to database')
      // Save to database with folder assignment
      const newContract = await contractsApi.create({
        user_id: currentUser.id,
        title,
        content: extractedText,
        upload_url: null,
        file_key: null,
        folder_id: selectedFolder,
        analysis_cache: {}
      })
      console.log('✅ File Upload - Database save successful, contract ID:', newContract.id)
      
      // Trigger automatic analysis
      console.log('🤖 File Upload - Starting automatic analysis')
      try {
        const analysisResponse = await fetch('/api/contract/auto-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: newContract.id })
        })
        
        if (analysisResponse.ok) {
          console.log('✅ File Upload - Automatic analysis started successfully')
          onToast?.('Contract uploaded! AI analysis started automatically.', 'success')
        } else {
          console.warn('⚠️ File Upload - Analysis start failed, but contract uploaded successfully')
          onToast?.('Contract uploaded successfully! You can analyze it manually.', 'success')
        }
      } catch (analysisError) {
        console.error('❌ File Upload - Analysis trigger failed:', analysisError)
        onToast?.('Contract uploaded successfully! You can analyze it manually.', 'success')
      }
      
      onContractsUpdate()
      
      // Automatically select and load the newly uploaded contract
      console.log('🎯 File Upload - Auto-selecting newly uploaded contract')
      onContractClick(newContract)
      
      // Reset file input
      event.target.value = ''
      console.log('🎉 File Upload - Upload process completed successfully')
    } catch (error) {
      console.error('❌ File Upload - Upload failed:', error)
      console.error('Error details:', {
        fileName: file.name,
        errorMessage: error.message || 'Unknown error',
        errorStack: error.stack || 'No stack trace'
      })
      
      // Provide user-friendly error message based on the error type
      let userMessage = 'Failed to upload contract. Please try again.'
      if (error.message?.includes('mammoth')) {
        userMessage = 'Failed to read the document. Please ensure it\'s a valid .docx file.'
      } else if (error.message?.includes('User not authenticated')) {
        userMessage = 'You need to be logged in to upload contracts.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.'
      }
      
      onToast?.(userMessage, 'error')
    } finally {
      setUploading(false)
    }
  }

  // Delete contract function
  const handleDeleteContract = (contract: Contract, event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    
    if (isDragging) return
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Contract',
      message: `Are you sure you want to delete "${contract.title}"?\n\nThis action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await contractsApi.delete(contract.id)
          onContractsUpdate()
          onToast?.(`Contract "${contract.title}" deleted successfully`, 'success')
        } catch (error) {
          console.error('Error deleting contract:', error)
          onToast?.('Failed to delete contract. Please try again.', 'error')
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const renderContractItem = (contract: Contract, level: number = 0) => {
    const truncatedTitle = contract.title.length > 20 
      ? contract.title.substring(0, 20) + '...' 
      : contract.title

    const isBeingDragged = draggedContract?.id === contract.id
    const isOtherDragging = isDragging && !isBeingDragged

    return (
      <div
        key={contract.id}
        className={`${styles.contractItem} ${isBeingDragged ? styles.dragging : ''}`}
        style={{ 
          marginLeft: `${(level + 1) * 20}px`,
          opacity: isBeingDragged ? 0.5 : isOtherDragging ? 0.7 : 1,
          transform: isBeingDragged ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.2s ease',
          cursor: isBeingDragged ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          position: 'relative',
          border: isBeingDragged ? '2px dashed rgba(17, 24, 39, 0.5)' : '2px solid transparent',
          borderRadius: '4px',
          background: isBeingDragged ? 'rgba(17, 24, 39, 0.05)' : ''
        }}
        draggable={true}
        onDragStart={(e) => {
          handleContractDragStart(e, contract)
        }}
        onDragEnd={(e) => {
          handleContractDragEnd(e)
        }}
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          console.log('🖱️ Sidebar contract clicked:', {
            contractId: contract.id,
            contractTitle: contract.title,
            hasContent: !!contract.content,
            timestamp: new Date().toISOString()
          })
          onContractClick(contract)
        }}
        title={isBeingDragged ? `Dragging: ${contract.title}` : contract.title}
      >
        <div className={styles.expandIcon} style={{ pointerEvents: 'none' }}></div>
        <svg className={styles.contractIcon} viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span className={styles.contractName} style={{ pointerEvents: 'none' }}>{truncatedTitle}</span>
        
        {/* Delete Contract Button */}
        <button
          className={styles.deleteContractButton}
          style={{
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
          onClick={(e) => handleDeleteContract(contract, e)}
          title="Delete contract"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    )
  }

  // Delete folder function with validation
  const handleDeleteFolder = (folder: FolderTreeItem, event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    
    if (isDragging || editingFolder === folder.id) return
    
    // Check if folder has contracts
    const folderContracts = contracts.filter(contract => contract.folder_id === folder.id)
    if (folderContracts.length > 0) {
      onToast?.(
        `Cannot delete "${folder.name}" - it contains ${folderContracts.length} contract${folderContracts.length > 1 ? 's' : ''}. Please move or delete the contracts first.`,
        'error'
      )
      return
    }
    
    // Check if folder has subfolders
    if (folder.children.length > 0) {
      onToast?.(
        `Cannot delete "${folder.name}" - it contains ${folder.children.length} subfolder${folder.children.length > 1 ? 's' : ''}. Please delete the subfolders first.`,
        'error'
      )
      return
    }
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete the folder "${folder.name}"?\n\nThis action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await foldersApi.delete(folder.id)
          onFoldersUpdate()
          
          // If this was the selected folder, clear the selection
          if (selectedFolder === folder.id) {
            onSelectFolder(null)
          }
          
          onToast?.(`Folder "${folder.name}" deleted successfully`, 'success')
        } catch (error) {
          console.error('Error deleting folder:', error)
          onToast?.('Failed to delete folder. Please try again.', 'error')
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const renderFolderItem = (folder: FolderTreeItem, level: number = 0) => {
    const isSelected = selectedFolder === folder.id
    const hasChildren = folder.children.length > 0
    const isExpanded = folder.isExpanded
    const isEditing = editingFolder === folder.id
    const folderContracts = filteredContracts.filter(contract => contract.folder_id === folder.id)

    const isDragOver = dragOverFolder === folder.id
    const canDrop = isDragging && draggedContract && draggedContract.folder_id !== folder.id
    const isSameFolder = isDragging && draggedContract && draggedContract.folder_id === folder.id

    return (
      <div key={folder.id}>
        <div
          className={`${styles.folderItem} ${isSelected ? styles.selected : ''} ${isDragOver ? styles.dragOver : ''} ${canDrop ? 'drop-target' : ''}`}
          style={{ 
            marginLeft: `${level * 20}px`,
            backgroundColor: (isDragging && isDragOver && canDrop) ? 'rgba(17, 24, 39, 0.1)' : '',
            border: (isDragging && isDragOver && canDrop) ? '2px solid rgba(17, 24, 39, 0.3)' : '2px solid transparent',
            borderRadius: '6px',
            transform: (isDragging && isDragOver && canDrop) ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            boxShadow: (isDragging && isDragOver && canDrop) ? '0 4px 12px rgba(17, 24, 39, 0.2)' : 'none',
            position: 'relative',
            opacity: isSameFolder ? 0.5 : 1,
            cursor: isSameFolder ? 'not-allowed' : (isDragging && !canDrop) ? 'not-allowed' : 'pointer',
            // Ensure all drag events can reach this element
            pointerEvents: 'auto'
          }}
          onClick={() => !isEditing && !isDragging && onSelectFolder(folder.id)}
          onDoubleClick={() => !isDragging && handleEditFolder(folder)}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleFolderDragOver(e, folder.id)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleFolderDragEnter(e, folder.id)
          }}
          onDragLeave={(e) => {
            e.stopPropagation()
            handleFolderDragLeave(e, folder.id)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleFolderDrop(e, folder.id)
          }}
        >
          <button
            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
            style={{
              // Prevent interference with drag events on parent
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDragging) {
                toggleFolder(folder.id)
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          
          <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
          </svg>
          
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'edit')}
              onBlur={handleSaveEdit}
              className={styles.folderNameInput}
              style={{ pointerEvents: 'auto' }}
              autoFocus
            />
          ) : (
            <span className={styles.folderName} style={{ pointerEvents: 'none' }}>{folder.name}</span>
          )}
          
          {!isEditing && folder.contractCount > 0 && (
            <span className={styles.folderCount} style={{ pointerEvents: 'none' }}>({folder.contractCount})</span>
          )}
          
          {!isEditing && (
            <>
              <button
                className={styles.editFolderButton}
                style={{
                  // Prevent interference with drag events on parent
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDragging) {
                    handleEditFolder(folder)
                  }
                }}
                title="Rename folder"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              
              <button
                className={styles.deleteFolderButton}
                style={{
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onClick={(e) => handleDeleteFolder(folder, e)}
                title="Delete folder"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <div>
            {/* Show contracts in this folder */}
            {folderContracts.map(contract => renderContractItem(contract, level))}
            
            {/* Show child folders */}
            {hasChildren && folder.children.map(child => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const folderTree = buildFolderTree()
  
  // Filter folders and contracts based on search term
  const filteredTree = searchTerm
    ? folderTree.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : folderTree

  const filteredContracts = searchTerm
    ? contracts.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (contract.analysis_status === 'complete' || contract.analysis_status === null) // Show completed or legacy contracts
      )
    : contracts.filter(contract => 
        contract.analysis_status === 'complete' || contract.analysis_status === null // Show completed or legacy contracts
      )

  return (
    <div 
      className={`flex flex-col ${isDragging ? 'dragging-active' : ''}`} 
      style={{
        backgroundColor: '#F5F5F5',
        borderRight: '1px solid #e5e7eb',
        width: '280px',
        height: '100%',
        maxHeight: 'calc(100vh - 64px)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 0
      }}
      onDragOver={(e) => {
        e.preventDefault() // CRITICAL: Allow drag events to pass through
      }}
      onDragEnter={(e) => {
        e.preventDefault()
      }}
    >
      {/* Fixed Header Section */}
      <div style={{ flexShrink: 0 }}>
        {/* Action Buttons - Above search bar */}
        <div className={styles.actionsSection}>
          {/* Create Folder Button */}
          <button
            className={styles.createFolderButton}
            onClick={handleCreateFolder}
            disabled={creatingFolder || isDragging}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>{creatingFolder ? 'Creating...' : 'New Folder'}</span>
          </button>

          {/* Upload Contract Button */}
          <div className={styles.uploadSection}>
            <input
              type="file"
              id="contract-upload-compact"
              accept=".docx"
              onChange={handleFileUpload}
              className={styles.hiddenInput}
              disabled={uploading || isDragging}
            />
            <label 
              htmlFor="contract-upload-compact" 
              className={styles.uploadButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{uploading ? 'Uploading...' : 'Upload (docx)'}</span>
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search folders and contracts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchBar}
          disabled={isDragging}
        />
        

        {/* iOS-Style Drag Guidance */}
        {isDragging && draggedContract && (
          <div className={styles.iosDragHint}>
            <div className={styles.iosDragIcon}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 13l3 3 7-7"/>
              </svg>
            </div>
            <div className={styles.iosDragText}>
              <div className={styles.iosDragTitle}>Move to folder</div>
              <div className={styles.iosDragSubtitle}>"{draggedContract.title}"</div>
            </div>
          </div>
        )}
      </div>

      {/* SCROLLABLE Content Area - Only this section scrolls */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          maxHeight: showUserSection ? 'calc(100vh - 64px - 200px)' : 'calc(100vh - 64px - 120px)',
          padding: '0 16px',
          paddingBottom: showUserSection ? '16px' : '24px',
          // Custom scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}
        className="custom-scrollbar"
        onDragOver={(e) => {
          e.preventDefault() // CRITICAL: Allow drag events to pass through
        }}
        onDragEnter={(e) => {
          e.preventDefault()
        }}
      >
        {/* Search Results Section */}
        {searchTerm && (
          <div>
            <div className={styles.searchResultsHeader}>
              Search Results ({filteredTree.length + filteredContracts.length} found)
            </div>
            
            {/* Matching Folders */}
            {filteredTree.map(folder => (
              <div
                key={`search-folder-${folder.id}`}
                className={`${styles.folderItem} ${selectedFolder === folder.id ? styles.selected : ''}`}
                onClick={() => onSelectFolder(folder.id)}
              >
                <div className={styles.expandIcon}></div>
                <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                </svg>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>({folder.contractCount})</span>
              </div>
            ))}
            
            {/* Matching Contracts */}
            {filteredContracts.map(contract => 
              renderContractItem(contract, 0)
            )}
            
            {filteredTree.length === 0 && filteredContracts.length === 0 && (
              <div className={styles.noResults}>
                No folders or contracts found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Normal Folder Tree (when not searching) */}
        {!searchTerm && (
          <div>
            {/* All Contracts Item - No drop styling since dropping is disabled */}
            <div
              className={`${styles.folderItem} ${selectedFolder === null ? styles.selected : ''}`}
              style={{
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                opacity: isDragging ? 0.6 : 1,
                cursor: isDragging ? 'not-allowed' : 'pointer',
                pointerEvents: 'auto'
              }}
              onClick={() => !isDragging && onSelectFolder(null)}
            >
              <button
                className={`${styles.expandIcon} ${expandedFolders.has('all') ? styles.expanded : ''}`}
                style={{
                  pointerEvents: isDragging ? 'none' : 'auto'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDragging) {
                    const newExpanded = new Set(expandedFolders)
                    if (newExpanded.has('all')) {
                      newExpanded.delete('all')
                    } else {
                      newExpanded.add('all')
                    }
                    setExpandedFolders(newExpanded)
                  }
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span className={styles.folderName} style={{ pointerEvents: 'none' }}>All Contracts</span>
              <span className={styles.folderCount} style={{ pointerEvents: 'none' }}>({contracts.length})</span>
            </div>

            {/* Show all contracts when All Contracts is expanded */}
            {expandedFolders.has('all') && (
              <div>
                {/* Show ALL contracts (regardless of folder) */}
                {filteredContracts.map(contract => 
                  renderContractItem(contract, 0)
                )}
              </div>
            )}

            {/* Folder Tree */}
            {filteredTree.map(folder => renderFolderItem(folder))}
          </div>
        )}
        
        {/* New Folder Creation */}
        {creatingFolder && (
          <div className={styles.folderItem} style={{ marginLeft: '0px' }}>
            <div className={styles.expandIcon}></div>
            <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'create')}
              onBlur={handleCreateFolderSubmit}
              className={styles.folderNameInput}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Fixed User Footer - Only shown when showUserSection is true */}
      {showUserSection && (
        <div style={{
          flexShrink: 0,
          padding: '16px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F5F5F5',
          marginTop: 'auto',
          maxHeight: '100px'
        }}>
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className={styles.signOutButton}
              title="Sign out"
              disabled={isDragging}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Button>
          </div>
          <p className={styles.userEmail} style={{
            fontSize: '12px',
            color: '#6B7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user?.email}
          </p>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}