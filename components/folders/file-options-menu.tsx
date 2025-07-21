'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, FolderOpen, Copy, Trash2, Edit3 } from 'lucide-react'
import styles from './file-options-menu.module.css'

interface FileOptionsMenuProps {
  onMove: () => void
  onCopy: () => void
  onDelete: () => void
  onRename: () => void
  className?: string
}

export default function FileOptionsMenu({
  onMove,
  onCopy,
  onDelete,
  onRename,
  className = ''
}: FileOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleOptionClick = (callback: () => void) => {
    setIsOpen(false)
    callback()
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        ref={buttonRef}
        className={styles.menuButton}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        aria-label="File options"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div ref={menuRef} className={styles.dropdown}>
          <button
            className={styles.option}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionClick(onMove)
            }}
          >
            <FolderOpen size={14} />
            <span>Move to folder</span>
          </button>

          <button
            className={styles.option}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionClick(onCopy)
            }}
          >
            <Copy size={14} />
            <span>Copy to folder</span>
          </button>

          <button
            className={styles.option}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionClick(onRename)
            }}
          >
            <Edit3 size={14} />
            <span>Rename</span>
          </button>

          <div className={styles.divider} />

          <button
            className={`${styles.option} ${styles.danger}`}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionClick(onDelete)
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}