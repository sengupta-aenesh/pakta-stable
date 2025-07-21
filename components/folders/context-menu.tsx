'use client'

import { useEffect, useRef } from 'react'
import { FolderOpen, Copy, Trash2, Edit3 } from 'lucide-react'
import styles from './context-menu.module.css'

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  onMove: () => void
  onCopy: () => void
  onDelete: () => void
  onRename: () => void
}

export default function ContextMenu({
  isOpen,
  position,
  onClose,
  onMove,
  onCopy,
  onDelete,
  onRename
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Prevent default context menu
      document.addEventListener('contextmenu', preventDefault)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('contextmenu', preventDefault)
      }
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Adjust position if menu would go off-screen
      const rect = menuRef.current.getBoundingClientRect()
      const { innerWidth, innerHeight } = window
      
      let adjustedX = position.x
      let adjustedY = position.y
      
      if (rect.right > innerWidth) {
        adjustedX = position.x - rect.width
      }
      
      if (rect.bottom > innerHeight) {
        adjustedY = position.y - rect.height
      }
      
      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [isOpen, position])

  function preventDefault(e: Event) {
    e.preventDefault()
  }

  const handleOptionClick = (callback: () => void) => {
    callback()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      ref={menuRef} 
      className={styles.contextMenu}
      style={{ left: position.x, top: position.y }}
    >
      <button
        className={styles.option}
        onClick={() => handleOptionClick(onMove)}
      >
        <FolderOpen size={14} />
        <span>Move to folder</span>
      </button>

      <button
        className={styles.option}
        onClick={() => handleOptionClick(onCopy)}
      >
        <Copy size={14} />
        <span>Copy to folder</span>
      </button>

      <button
        className={styles.option}
        onClick={() => handleOptionClick(onRename)}
      >
        <Edit3 size={14} />
        <span>Rename</span>
      </button>

      <div className={styles.divider} />

      <button
        className={`${styles.option} ${styles.danger}`}
        onClick={() => handleOptionClick(onDelete)}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  )
}