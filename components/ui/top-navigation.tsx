'use client'

import { useRouter, usePathname } from 'next/navigation'
import NotificationBell from '../notifications/NotificationBell'
import ProfileMenu from './profile-menu'
import { AuthUser } from '@/lib/auth-client'
import styles from './top-navigation.module.css'

interface TopNavigationProps {
  currentPage?: 'folders' | 'create' | 'analysis' | 'template-dashboard'
  contractTitle?: string
  onContractTitleChange?: (title: string) => void
  showLogo?: boolean
  user?: AuthUser | null
  onSignOut?: () => void
}

export default function TopNavigation({ 
  currentPage = 'folders', 
  contractTitle,
  onContractTitleChange,
  showLogo = true,
  user,
  onSignOut
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M7 7h10"/>
          <path d="M7 11h10"/>
          <path d="M7 15h6"/>
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

        {/* Right side - navigation icons and notifications */}
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
          
          {/* Notification Bell */}
          <div className={styles.notificationWrapper}>
            <NotificationBell />
          </div>
          
          {/* Profile Menu */}
          {user && (
            <ProfileMenu user={user} onSignOut={onSignOut} />
          )}
        </div>
      </div>
    </div>
  )
}