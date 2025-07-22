'use client'

import { useState, useEffect, useImperativeHandle, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmationDialog } from '@/components/ui'
import { foldersApi, Folder } from '@/lib/folders-api'
import { Contract, contractsApi, Template, templatesApi, TemplateFolder, templateFoldersApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import mammoth from 'mammoth'
import styles from '@/app/folders/folders.module.css'
import ContractStatusBadge from '@/components/contracts/contract-status-badge'
import UploadFlowStatus from '@/components/contracts/upload-flow-status'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import { notificationHelpers } from '@/components/notifications/notification.utils'

interface UnifiedSidebarProps {
  folders: Folder[]
  contracts: Contract[]
  selectedFolder: string | null
  onSelectFolder: (folderId: string | null) => void
  onFoldersUpdate: () => void
  onContractsUpdate: () => void
  onContractClick: (contract: Contract) => void
  // Template props
  templateFolders?: TemplateFolder[]
  templates?: Template[]
  selectedTemplateFolder?: string | null
  onSelectTemplateFolder?: (folderId: string | null) => void
  onTemplateFoldersUpdate?: () => void
  onTemplatesUpdate?: () => void
  onTemplateClick?: (template: Template) => void
  // Common props
  user: any
  showUserSection?: boolean
  onSignOut?: () => void
  // Removed onToast - using notification system internally
  // View mode
  viewMode?: 'contracts' | 'templates'
  onViewModeChange?: (mode: 'contracts' | 'templates') => void
  showViewModeToggle?: boolean // New prop to explicitly control toggle visibility
}

interface FolderTreeItem extends Folder {
  children: FolderTreeItem[]
  contractCount: number
  isExpanded: boolean
}

interface TemplateFolderTreeItem extends TemplateFolder {
  children: TemplateFolderTreeItem[]
  templateCount: number
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
  // Template props
  templateFolders = [],
  templates = [],
  selectedTemplateFolder = null,
  onSelectTemplateFolder = () => {},
  onTemplateFoldersUpdate = () => {},
  onTemplatesUpdate = () => {},
  onTemplateClick = () => {},
  // Common props
  user,
  showUserSection = false,
  onSignOut,
  // View mode
  viewMode = 'contracts',
  onViewModeChange = () => {},
  showViewModeToggle = false
}: UnifiedSidebarProps) {
  const router = useRouter()
  const notifications = useEnhancedNotifications()
  const { notify } = notifications
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
  const [uploadProgress, setUploadProgress] = useState<{step: string, progress: number} | null>(null)
  const [uploadStep, setUploadStep] = useState<string>('')
  const [uploadError, setUploadError] = useState<string>('')
  
  // Template-specific state (mirroring contract state)
  const [expandedTemplateFolders, setExpandedTemplateFolders] = useState<Set<string>>(new Set())
  const [editingTemplateFolder, setEditingTemplateFolder] = useState<string | null>(null)
  const [editingTemplateName, setEditingTemplateName] = useState('')
  const [creatingTemplateFolder, setCreatingTemplateFolder] = useState(false)
  const [newTemplateFolderName, setNewTemplateFolderName] = useState('')
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null)
  const [dragOverTemplateFolder, setDragOverTemplateFolder] = useState<string | null>(null)
  const [isTemplateDragging, setIsTemplateDragging] = useState(false)
  const [uploadingTemplate, setUploadingTemplate] = useState(false)
  const [templateUploadProgress, setTemplateUploadProgress] = useState<{step: string, progress: number} | null>(null)
  const [templateUploadStep, setTemplateUploadStep] = useState<string>('')
  const [templateUploadError, setTemplateUploadError] = useState<string>('')
  
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

  // Build template folder tree
  const buildTemplateFolderTree = (): TemplateFolderTreeItem[] => {
    const folderMap = new Map<string, TemplateFolderTreeItem>()
    
    // Initialize all template folders
    templateFolders.forEach(folder => {
      const templateCount = templates.filter(template => template.folder_id === folder.id).length
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        templateCount,
        isExpanded: expandedTemplateFolders.has(folder.id)
      })
    })

    // Build tree structure
    const rootFolders: TemplateFolderTreeItem[] = []
    templateFolders.forEach(folder => {
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

  const toggleTemplateFolder = (folderId: string) => {
    const newExpanded = new Set(expandedTemplateFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedTemplateFolders(newExpanded)
  }

  const handleCreateFolder = async () => {
    if (!user) return
    setCreatingFolder(true)
    setNewFolderName('New Folder')
  }

  const handleCreateTemplateFolder = async () => {
    if (!user) return
    setCreatingTemplateFolder(true)
    setNewTemplateFolderName('New Template Folder')
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
      notifications.success('Folder Created', 'Folder created successfully!')
    } catch (error) {
      console.error('Failed to create folder:', error)
      notifications.error('Creation Failed', 'Failed to create folder. Please try again.')
      setCreatingFolder(false)
      setNewFolderName('')
    }
  }

  const handleCreateTemplateFolderSubmit = async () => {
    if (!user || !newTemplateFolderName.trim()) {
      setCreatingTemplateFolder(false)
      setNewTemplateFolderName('')
      return
    }
    
    try {
      await templateFoldersApi.create({
        user_id: user.id,
        name: newTemplateFolderName.trim(),
        parent_id: selectedTemplateFolder || null
      })
      setCreatingTemplateFolder(false)
      setNewTemplateFolderName('')
      if (onTemplateFoldersUpdate) onTemplateFoldersUpdate()
      notifications.success('Folder Created', 'Template folder created successfully!')
    } catch (error) {
      console.error('Failed to create template folder:', error)
      notifications.error('Creation Failed', 'Failed to create template folder. Please try again.')
      setCreatingTemplateFolder(false)
      setNewTemplateFolderName('')
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
      notifications.success('Folder Renamed', 'Folder renamed successfully!')
    } catch (error) {
      console.error('Failed to update folder:', error)
      notifications.error('Rename Failed', 'Failed to rename folder. Please try again.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'edit' | 'create-template') => {
    if (e.key === 'Enter') {
      if (action === 'create') {
        handleCreateFolderSubmit()
      } else if (action === 'create-template') {
        handleCreateTemplateFolderSubmit()
      } else {
        handleSaveEdit()
      }
    } else if (e.key === 'Escape') {
      if (action === 'create') {
        setCreatingFolder(false)
        setNewFolderName('')
      } else if (action === 'create-template') {
        setCreatingTemplateFolder(false)
        setNewTemplateFolderName('')
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

  // Template drag and drop handlers
  const handleTemplateDragStart = (e: React.DragEvent, template: Template) => {
    console.log('🎯 Template Drag Start:', template.title)
    
    // Set drag data immediately
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', template.id)
    
    // Simple state updates with delay to prevent cancellation
    setTimeout(() => {
      setDraggedTemplate(template)
      setIsTemplateDragging(true)
    }, 50)
  }

  const handleTemplateDragEnd = (e: React.DragEvent) => {
    console.log('🏁 Template Drag End')
    setDraggedTemplate(null)
    setDragOverTemplateFolder(null)
    setIsTemplateDragging(false)
  }

  // Template folder drag handlers
  const handleTemplateFolderDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📁 Template Drag Over Folder:', folderId, 'draggedTemplate:', !!draggedTemplate)
    
    let draggedTemplateData = draggedTemplate
    if (!draggedTemplateData) {
      const templateId = e.dataTransfer.getData('text/plain')
      if (templateId) {
        draggedTemplateData = templates.find(t => t.id === templateId) || null
      }
    }
    
    if (draggedTemplateData && draggedTemplateData.folder_id !== folderId) {
      setDragOverTemplateFolder(folderId)
    }
  }

  const handleTemplateFolderDragEnter = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTemplateFolder(folderId)
  }

  const handleTemplateFolderDragLeave = (e: React.DragEvent, folderId: string | null) => {
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setDragOverTemplateFolder(null)
    }
  }

  const handleTemplateFolderDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🎯 Template Drop in Folder:', folderId)
    
    const templateId = e.dataTransfer.getData('text/plain')
    let draggedTemplateData = draggedTemplate
    
    if (!draggedTemplateData && templateId) {
      draggedTemplateData = templates.find(t => t.id === templateId) || null
    }
    
    if (!draggedTemplateData) {
      console.error('❌ No template data found for drop')
      setDragOverTemplateFolder(null)
      return
    }
    
    const targetFolderName = folderId ? templateFolders.find(f => f.id === folderId)?.name || 'folder' : 'All Templates'
    
    console.log('🎯 Template Drag & Drop - Starting drop operation:', {
      templateId: draggedTemplateData.id,
      templateTitle: draggedTemplateData.title,
      fromFolder: draggedTemplateData.folder_id || 'All Templates',
      targetFolderId: folderId,
      targetFolderName
    })
    
    try {
      await templatesApi.update(draggedTemplateData.id, { folder_id: folderId })
      console.log('✅ Template moved successfully')
      onTemplatesUpdate()
      notify(notificationHelpers.fileMoved(draggedTemplateData.title, targetFolderName))
    } catch (error) {
      console.error('❌ Error moving template:', error)
      notifications.error('Move Failed', 'Failed to move template. Please try again.')
    }
    
    setDragOverTemplateFolder(null)
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
      notifications.error('Invalid Move', 'Cannot move contracts to "All Contracts" section')
      return
    }
    
    // Prevent dropping on the same folder
    if (draggedContractData.folder_id === folderId) {
      console.log('ℹ️ Contract already in this folder')
      setDragOverFolder(null)
      setIsDragging(false)
      setDraggedContract(null)
      notifications.info('No Change', 'Contract is already in this folder')
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
      notify(notificationHelpers.fileMoved(draggedContractData.title, targetFolderName))
    } catch (error) {
      console.error('❌ Drag & Drop - Failed to move contract:', error)
      console.error('Error details:', {
        contractId: draggedContractData.id,
        targetFolderId: folderId,
        errorMessage: error.message || 'Unknown error'
      })
      notifications.error('Move Failed', 'Failed to move contract. Please try again.')
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


  // Template upload function
  async function handleTemplateUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingTemplate(true)
      setTemplateUploadError('')
      setTemplateUploadStep('extract')
      setTemplateUploadProgress({step: 'Extracting text from document...', progress: 20})
      
      console.log('📄 Template Upload - Extracting text from docx file')
      // Extract text from docx
      const extractedText = await extractTextFromDocx(file)
      console.log('✅ Template Upload - Text extraction successful, length:', extractedText.length)
      setTemplateUploadStep('save')
      setTemplateUploadProgress({step: 'Processing template...', progress: 40})
      
      // Extract title from filename
      const title = file.name.replace('.docx', '')
      console.log('📝 Template Upload - Extracted title:', title)
      
      // Get current user
      console.log('👤 Template Upload - Getting current user')
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.error('❌ Template Upload - User not authenticated')
        throw new Error('User not authenticated')
      }
      console.log('✅ Template Upload - User authenticated:', currentUser.email)
      
      setTemplateUploadProgress({step: 'Saving template to database...', progress: 60})
      console.log('💾 Template Upload - Saving to database')
      // Save to database with folder assignment
      const newTemplate = await templatesApi.create({
        user_id: currentUser.id,
        title,
        content: extractedText,
        upload_url: null,
        file_key: null,
        folder_id: selectedTemplateFolder,
        analysis_cache: {},
        analysis_status: 'pending',
        analysis_progress: 0,
        resolved_risks: []
      })
      console.log('✅ Template Upload - Database save successful, template ID:', newTemplate.id)
      setTemplateUploadStep('complete')
      setTemplateUploadProgress({step: 'Upload complete!', progress: 100})
      
      // Template uploaded successfully - NO automatic analysis (matches contract flow)
      console.log('✅ Template Upload - Template uploaded successfully')
      notify(notificationHelpers.fileUploaded(file.name, 'template'))
      
      // Refresh template list first, then select the new template
      onTemplatesUpdate()
      
      // Small delay to ensure the template list is updated before selection
      setTimeout(() => {
        console.log('🎯 Template Upload - Auto-selecting newly uploaded template')
        onTemplateClick(newTemplate)
      }, 200)
      
      // Reset file input
      event.target.value = ''
      console.log('🎉 Template Upload - Upload process completed successfully')
    } catch (error) {
      console.error('❌ Template Upload - Upload failed:', error)
      console.error('Error details:', {
        fileName: file.name,
        errorMessage: error.message || 'Unknown error',
        errorStack: error.stack || 'No stack trace'
      })
      
      // Provide user-friendly error message based on the error type
      let userMessage = 'Failed to upload template. Please try again.'
      if (error.message?.includes('mammoth')) {
        userMessage = 'Failed to read the document. Please ensure it\'s a valid .docx file.'
      } else if (error.message?.includes('User not authenticated')) {
        userMessage = 'You need to be logged in to upload templates.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.'
      }
      
      setTemplateUploadError(userMessage)
      notifications.error('Upload Failed', userMessage)
    } finally {
      setUploadingTemplate(false)
      // Clear progress after a short delay
      setTimeout(() => {
        setTemplateUploadProgress(null)
        setTemplateUploadStep('')
        setTemplateUploadError('')
      }, 3000)
    }
  }

  // Contract upload function (renamed for clarity)
  async function handleContractUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setUploadError('')
      setUploadStep('extract')
      setUploadProgress({step: 'Extracting text from document...', progress: 20})
      
      console.log('📄 File Upload - Extracting text from docx file')
      // Extract text from docx
      const extractedText = await extractTextFromDocx(file)
      console.log('✅ File Upload - Text extraction successful, length:', extractedText.length)
      setUploadStep('save')
      setUploadProgress({step: 'Processing document...', progress: 40})
      
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
      
      setUploadProgress({step: 'Saving contract to database...', progress: 60})
      console.log('💾 File Upload - Saving to database')
      // Save to database with folder assignment
      const newContract = await contractsApi.create({
        user_id: currentUser.id,
        title,
        content: extractedText,
        upload_url: null,
        file_key: null,
        folder_id: selectedFolder,
        analysis_cache: {},
        analysis_status: null,
        analysis_progress: null
      })
      console.log('✅ File Upload - Database save successful, contract ID:', newContract.id)
      setUploadStep('complete')
      setUploadProgress({step: 'Upload complete!', progress: 100})
      
      // Contract uploaded successfully - no automatic analysis
      console.log('✅ File Upload - Contract uploaded successfully')
      notify(notificationHelpers.fileUploaded(file.name, 'contract'))
      
      // Refresh contract list first, then select the new contract
      onContractsUpdate()
      
      // Small delay to ensure the contract list is updated before selection
      setTimeout(() => {
        console.log('🎯 File Upload - Auto-selecting newly uploaded contract')
        onContractClick(newContract)
      }, 200)
      
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
      
      setUploadError(userMessage)
      notifications.error('Upload Failed', userMessage)
    } finally {
      setUploading(false)
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null)
        setUploadStep('')
        setUploadError('')
      }, 3000)
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
          notify(notificationHelpers.fileDeleted(contract.title))
        } catch (error) {
          console.error('Error deleting contract:', error)
          notifications.error('Delete Failed', 'Failed to delete contract. Please try again.')
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  // Delete template function
  const handleDeleteTemplate = (template: Template, event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    
    if (isTemplateDragging) return
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Template',
      message: `Are you sure you want to delete "${template.title}"?\n\nThis action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await templatesApi.delete(template.id)
          onTemplatesUpdate()
          notify(notificationHelpers.fileDeleted(template.title))
        } catch (error) {
          console.error('Error deleting template:', error)
          notifications.error('Delete Failed', 'Failed to delete template. Please try again.')
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
        
        {/* Contract Status Badge */}
        <ContractStatusBadge 
          status={contract.analysis_status as any}
          progress={contract.analysis_progress || 0}
          size="small"
        />
        
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

  // Template render functions (mirroring contract functions)
  const renderTemplateItem = (template: Template, level: number = 0) => {
    const truncatedTitle = template.title.length > 20 
      ? template.title.substring(0, 20) + '...' 
      : template.title

    const isBeingDragged = draggedTemplate?.id === template.id
    const isOtherDragging = isTemplateDragging && !isBeingDragged

    return (
      <div
        key={template.id}
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
          handleTemplateDragStart(e, template)
        }}
        onDragEnd={(e) => {
          handleTemplateDragEnd(e)
        }}
        onClick={(e) => {
          if (isTemplateDragging) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          console.log('🚨 DEBUG: Template clicked in sidebar:', {
            templateId: template.id,
            templateTitle: template.title,
            onTemplateClickExists: !!onTemplateClick
          })
          onTemplateClick(template)
        }}
        title={isBeingDragged ? `Dragging: ${template.title}` : template.title}
      >
        <div className={styles.expandIcon} style={{ pointerEvents: 'none' }}></div>
        <svg className={styles.contractIcon} viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span className={styles.contractName} style={{ pointerEvents: 'none' }}>{truncatedTitle}</span>
        
        {/* Template Status Badge */}
        <ContractStatusBadge 
          status={template.analysis_status as any}
          progress={template.analysis_progress || 0}
          size="small"
        />
        
        {/* Delete Template Button */}
        <button
          className={styles.deleteContractButton}
          style={{
            pointerEvents: isTemplateDragging ? 'none' : 'auto'
          }}
          onClick={(e) => handleDeleteTemplate(template, e)}
          title="Delete template"
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

  const renderTemplateFolderItem = (folder: TemplateFolderTreeItem, level: number = 0) => {
    const isSelected = selectedTemplateFolder === folder.id
    const isExpanded = folder.isExpanded
    const isEditing = editingTemplateFolder === folder.id
    const folderTemplates = templates.filter(template => template.folder_id === folder.id)

    const isDragOver = dragOverTemplateFolder === folder.id
    const canDrop = isTemplateDragging && draggedTemplate && draggedTemplate.folder_id !== folder.id
    const isSameFolder = isTemplateDragging && draggedTemplate && draggedTemplate.folder_id === folder.id

    return (
      <div key={folder.id}>
        <div
          className={`${styles.folderItem} ${isSelected ? styles.selected : ''} ${isDragOver ? styles.dragOver : ''} ${canDrop ? 'drop-target' : ''}`}
          style={{ 
            marginLeft: `${level * 20}px`,
            backgroundColor: (isTemplateDragging && isDragOver && canDrop) ? 'rgba(17, 24, 39, 0.1)' : '',
            border: (isTemplateDragging && isDragOver && canDrop) ? '2px solid rgba(17, 24, 39, 0.3)' : '2px solid transparent',
            borderRadius: '6px',
            transform: (isTemplateDragging && isDragOver && canDrop) ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            boxShadow: (isTemplateDragging && isDragOver && canDrop) ? '0 4px 12px rgba(17, 24, 39, 0.2)' : 'none',
            position: 'relative',
            opacity: isSameFolder ? 0.5 : 1,
            cursor: isSameFolder ? 'not-allowed' : (isTemplateDragging && !canDrop) ? 'not-allowed' : 'pointer',
            pointerEvents: 'auto'
          }}
          onClick={() => !isEditing && !isTemplateDragging && onSelectTemplateFolder(folder.id)}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTemplateFolderDragOver(e, folder.id)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTemplateFolderDragEnter(e, folder.id)
          }}
          onDragLeave={(e) => {
            e.stopPropagation()
            handleTemplateFolderDragLeave(e, folder.id)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTemplateFolderDrop(e, folder.id)
          }}
        >
          <button
            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              if (!isTemplateDragging) {
                toggleTemplateFolder(folder.id)
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
          
          <span className={styles.folderName} style={{ pointerEvents: 'none' }}>{folder.name}</span>
          
          {folder.templateCount > 0 && (
            <span className={styles.folderCount} style={{ pointerEvents: 'none' }}>({folder.templateCount})</span>
          )}
        </div>

        {/* Render template folder children */}
        {isExpanded && folder.children.map(childFolder => renderTemplateFolderItem(childFolder, level + 1))}
        
        {/* Render templates in this folder */}
        {isExpanded && folderTemplates.map(template => renderTemplateItem(template, level + 1))}
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
      notifications.error('Delete Failed', 
        `Cannot delete "${folder.name}" - it contains ${folderContracts.length} contract${folderContracts.length > 1 ? 's' : ''}. Please move or delete the contracts first.`
      )
      return
    }
    
    // Check if folder has subfolders
    if (folder.children.length > 0) {
      notifications.error('Delete Failed', 
        `Cannot delete "${folder.name}" - it contains ${folder.children.length} subfolder${folder.children.length > 1 ? 's' : ''}. Please delete the subfolders first.`
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
          
          notifications.success('Folder Deleted', `Folder "${folder.name}" deleted successfully`)
        } catch (error) {
          console.error('Error deleting folder:', error)
          notifications.error('Delete Failed', 'Failed to delete folder. Please try again.')
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

  // Build trees and filter data based on search term and view mode
  const folderTree = buildFolderTree()
  const templateFolderTree = buildTemplateFolderTree()

  const filteredTree = searchTerm && viewMode === 'contracts'
    ? folderTree.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : folderTree

  const filteredTemplateTree = searchTerm && viewMode === 'templates'
    ? templateFolderTree.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : templateFolderTree

  const filteredContracts = searchTerm && viewMode === 'contracts'
    ? contracts.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : contracts

  const filteredTemplates = searchTerm && viewMode === 'templates'
    ? templates.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : templates

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
        {/* View Mode Toggle - Only show when explicitly enabled */}
        {showViewModeToggle && (
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'contracts' ? styles.active : ''}`}
              onClick={() => onViewModeChange('contracts')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 8 9 8 9"/>
              </svg>
              <span>Contracts</span>
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'templates' ? styles.active : ''}`}
              onClick={() => onViewModeChange('templates')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span>Templates</span>
            </button>
          </div>
        )}

        {/* Action Buttons - Above search bar */}
        <div className={styles.actionsSection}>
          {/* Create Folder Button */}
          <button
            className={styles.createFolderButton}
            onClick={handleCreateFolder}
            disabled={creatingFolder || isDragging}
            data-create-folder={viewMode === 'contracts' ? 'true' : 'false'}
            style={{ display: viewMode === 'contracts' ? 'flex' : 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>{creatingFolder ? 'Creating...' : 'New Folder'}</span>
          </button>

          {/* Create Template Folder Button */}
          <button
            className={styles.createFolderButton}
            onClick={handleCreateTemplateFolder}
            disabled={creatingTemplateFolder || isTemplateDragging}
            data-create-template-folder={viewMode === 'templates' ? 'true' : 'false'}
            style={{ display: viewMode === 'templates' ? 'flex' : 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>{creatingTemplateFolder ? 'Creating...' : 'New Template Folder'}</span>
          </button>

          {/* Upload Buttons - Show based on view mode */}
          <div className={styles.uploadSection}>
            {/* Hidden File Inputs */}
            <input
              type="file"
              id="contract-upload"
              accept=".docx"
              onChange={handleContractUpload}
              className={styles.hiddenInput}
              disabled={uploading || isDragging}
            />
            <input
              type="file"
              id="template-upload"
              accept=".docx"
              onChange={handleTemplateUpload}
              className={styles.hiddenInput}
              disabled={uploadingTemplate || isTemplateDragging}
            />
            
            {/* Upload Contract Button - Only show in contracts view */}
            {viewMode === 'contracts' && (
              <label htmlFor="contract-upload" className={`${styles.uploadButton} ${styles.contractUpload}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>{uploading ? 'Uploading Contract...' : 'Upload Contract'}</span>
              </label>
            )}
            
            {/* Upload Template Button - Only show in templates view */}
            {viewMode === 'templates' && (
              <label htmlFor="template-upload" className={`${styles.uploadButton} ${styles.templateUpload}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>{uploadingTemplate ? 'Uploading Template...' : 'Upload Template'}</span>
              </label>
            )}
            
            {/* Upload Progress Status */}
            {(uploading || uploadingTemplate) && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '8px' }}>
                <UploadFlowStatus
                  currentStep={uploadingTemplate ? templateUploadStep : uploadStep}
                  progress={uploadingTemplate ? (templateUploadProgress?.progress || 0) : (uploadProgress?.progress || 0)}
                  error={uploadingTemplate ? templateUploadError : uploadError}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder={`Search ${viewMode === 'templates' ? 'folders and templates' : 'folders and contracts'}...`}
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
              Search Results ({
                viewMode === 'contracts' 
                  ? filteredTree.length + filteredContracts.length
                  : filteredTemplateTree.length + filteredTemplates.length
              } found)
            </div>
            
            {/* Contract Search Results */}
            {viewMode === 'contracts' && (
              <>
                {/* Matching Contract Folders */}
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
              </>
            )}

            {/* Template Search Results */}
            {viewMode === 'templates' && (
              <>
                {/* Matching Template Folders */}
                {filteredTemplateTree.map(folder => (
                  <div
                    key={`search-template-folder-${folder.id}`}
                    className={`${styles.folderItem} ${selectedTemplateFolder === folder.id ? styles.selected : ''}`}
                    onClick={() => onSelectTemplateFolder(folder.id)}
                  >
                    <div className={styles.expandIcon}></div>
                    <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                    <span className={styles.folderName}>{folder.name}</span>
                    <span className={styles.folderCount}>({folder.templateCount})</span>
                  </div>
                ))}
                
                {/* Matching Templates */}
                {filteredTemplates.map(template => 
                  renderTemplateItem(template, 0)
                )}
                
                {filteredTemplateTree.length === 0 && filteredTemplates.length === 0 && (
                  <div className={styles.noResults}>
                    No folders or templates found matching "{searchTerm}"
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Normal Folder Tree (when not searching) */}
        {!searchTerm && (
          <div>

            {/* Templates View */}
            {viewMode === 'templates' && (
              <>
                {/* All Templates Item */}
                <div
                  className={`${styles.folderItem} ${selectedTemplateFolder === null ? styles.selected : ''}`}
                  style={{
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    opacity: isTemplateDragging ? 0.6 : 1,
                    cursor: isTemplateDragging ? 'not-allowed' : 'pointer',
                    pointerEvents: 'auto'
                  }}
                  onClick={() => !isTemplateDragging && onSelectTemplateFolder(null)}
                >
                  <button
                    className={`${styles.expandIcon} ${expandedTemplateFolders.has('all') ? styles.expanded : ''}`}
                    style={{
                      pointerEvents: isTemplateDragging ? 'none' : 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isTemplateDragging) {
                        const newExpanded = new Set(expandedTemplateFolders)
                        if (newExpanded.has('all')) {
                          newExpanded.delete('all')
                        } else {
                          newExpanded.add('all')
                        }
                        setExpandedTemplateFolders(newExpanded)
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
                  <span className={styles.folderName} style={{ pointerEvents: 'none' }}>All Templates</span>
                  <span className={styles.folderCount} style={{ pointerEvents: 'none' }}>({templates.length})</span>
                </div>

                {/* Show all templates when All Templates is expanded */}
                {expandedTemplateFolders.has('all') && (
                  <div>
                    {templates.map(template => 
                      renderTemplateItem(template, 0)
                    )}
                  </div>
                )}

                {/* Template Folder Tree */}
                {buildTemplateFolderTree().map(folder => renderTemplateFolderItem(folder))}
              </>
            )}

            {/* Contracts View */}
            {viewMode === 'contracts' && (
              <>
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
              </>
            )}
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

        {/* New Template Folder Creation */}
        {creatingTemplateFolder && (
          <div className={styles.folderItem} style={{ marginLeft: '0px' }}>
            <div className={styles.expandIcon}></div>
            <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
            <input
              type="text"
              value={newTemplateFolderName}
              onChange={(e) => setNewTemplateFolderName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'create-template')}
              onBlur={handleCreateTemplateFolderSubmit}
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