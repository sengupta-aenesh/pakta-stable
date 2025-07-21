'use client'

import { useState } from 'react'
import { X, ChevronRight, Folder } from 'lucide-react'
import { Button } from '@/components/ui'
import styles from './folder-selection-modal.module.css'

interface FolderOption {
  id: string
  name: string
  parent_id: string | null
  children?: FolderOption[]
}

interface FolderSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (folderId: string | null) => void
  folders: FolderOption[]
  title: string
  currentFolderId?: string | null
  fileType: 'contract' | 'template'
}

export default function FolderSelectionModal({
  isOpen,
  onClose,
  onSelect,
  folders,
  title,
  currentFolderId,
  fileType
}: FolderSelectionModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  // Build folder tree
  const buildFolderTree = (folders: FolderOption[]): FolderOption[] => {
    const folderMap = new Map<string, FolderOption>()
    const rootFolders: FolderOption[] = []

    // Initialize all folders
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build tree structure
    folders.forEach(folder => {
      const folderItem = folderMap.get(folder.id)!
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id)!.children!.push(folderItem)
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

  const renderFolder = (folder: FolderOption, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isDisabled = folder.id === currentFolderId
    const isSelected = folder.id === selectedFolderId

    return (
      <div key={folder.id}>
        <div
          className={`${styles.folderItem} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
          style={{ paddingLeft: `${20 + level * 20}px` }}
          onClick={() => !isDisabled && setSelectedFolderId(folder.id)}
        >
          {hasChildren && (
            <button
              className={styles.expandButton}
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
            >
              <ChevronRight
                size={14}
                className={isExpanded ? styles.expanded : ''}
              />
            </button>
          )}
          <Folder size={16} className={styles.folderIcon} />
          <span className={styles.folderName}>{folder.name}</span>
          {isDisabled && <span className={styles.currentLabel}>(current)</span>}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const folderTree = buildFolderTree(folders)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Root level option */}
          <div
            className={`${styles.folderItem} ${selectedFolderId === null ? styles.selected : ''} ${currentFolderId === null ? styles.disabled : ''}`}
            onClick={() => currentFolderId !== null && setSelectedFolderId(null)}
          >
            <Folder size={16} className={styles.folderIcon} />
            <span className={styles.folderName}>
              {fileType === 'contract' ? 'All Contracts' : 'All Templates'}
            </span>
            {currentFolderId === null && <span className={styles.currentLabel}>(current)</span>}
          </div>

          {/* Folder tree */}
          <div className={styles.folderTree}>
            {folderTree.map(folder => renderFolder(folder))}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSelect(selectedFolderId)}
            disabled={selectedFolderId === currentFolderId}
          >
            Select Folder
          </Button>
        </div>
      </div>
    </div>
  )
}