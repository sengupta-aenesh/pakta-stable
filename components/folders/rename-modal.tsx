'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import styles from './rename-modal.module.css'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onRename: (newName: string) => void
  currentName: string
  itemType: 'contract' | 'template'
}

export default function RenameModal({
  isOpen,
  onClose,
  onRename,
  currentName,
  itemType
}: RenameModalProps) {
  const [newName, setNewName] = useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
      // Focus and select all text when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 100)
    }
  }, [isOpen, currentName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newName.trim()
    if (trimmedName && trimmedName !== currentName) {
      onRename(trimmedName)
    } else {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Rename {itemType}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
            placeholder={`Enter ${itemType} name`}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose()
              }
            }}
          />

          <div className={styles.footer}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newName.trim() || newName.trim() === currentName}
            >
              Rename
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}