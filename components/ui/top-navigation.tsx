'use client'

import { useRouter, usePathname } from 'next/navigation'
import styles from './top-navigation.module.css'

interface TopNavigationProps {
  currentPage?: 'folders' | 'create' | 'analysis' | 'template-dashboard'
  contractTitle?: string
  onContractTitleChange?: (title: string) => void
  showLogo?: boolean
}

export default function TopNavigation({ 
  currentPage = 'folders', 
  contractTitle,
  onContractTitleChange,
  showLogo = true 
}: TopNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      id: 'folders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h6m0 0h3a1 1 0 001-1V10M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6"/>
        </svg>
      ),
      label: 'Home',
      onClick: () => router.push('/folders'),
      active: currentPage === 'folders'
    },
    {
      id: 'create',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      ),
      label: 'Write',
      onClick: () => router.push('/contract-creator'),
      active: currentPage === 'create'
    },
    {
      id: 'analysis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z"/>
        </svg>
      ),
      label: 'Analysis',
      onClick: () => router.push('/dashboard'),
      active: currentPage === 'analysis'
    },
    {
      id: 'templates',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="21"/>
          <line x1="8" y1="13" x2="16" y2="21"/>
        </svg>
      ),
      label: 'Templates',
      onClick: () => router.push('/template-dashboard'),
      active: currentPage === 'template-dashboard'
    }
  ]

  return (
    <div className={styles.topNav}>
      <div className={styles.topNavContent}>
        {/* Left side - logo */}
        <div className={styles.navLeft}>
          {showLogo && (
            <img src="/logo.png" alt="Contract Manager" className={styles.logo} />
          )}
        </div>

        {/* Center - contract title if on dashboard */}
        <div className={styles.navCenter}>
          {contractTitle !== undefined && onContractTitleChange && (
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => onContractTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
              }}
              className={styles.contractTitleInput}
              placeholder="Document title..."
              title="Click to edit contract title - saves automatically"
            />
          )}
        </div>

        {/* Right side - navigation icons */}
        <div className={styles.navRight}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`${styles.navItem} ${item.active ? styles.active : ''}`}
              title={item.label}
            >
              <div className={styles.navIcon}>
                {item.icon}
              </div>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}