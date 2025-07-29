'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from './NotificationProvider'
import NotificationItem from './NotificationItem'
import styles from './notification.module.css'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export default function NotificationCenter({ isOpen, onClose, anchorRef }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAll,
    preferences,
    updatePreferences 
  } = useNotifications()
  
  const [activeTab, setActiveTab] = useState<'new' | 'all'>('new')
  const panelRef = useRef<HTMLDivElement>(null)

  // Filter notifications based on active tab
  const displayedNotifications = activeTab === 'new' 
    ? notifications.filter(n => !n.read)
    : notifications

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // Request notification permission when settings change
  useEffect(() => {
    if (preferences.desktopEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [preferences.desktopEnabled])

  if (!isOpen) return null

  return (
    <div className={styles.notificationCenter} ref={panelRef}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button
              className={styles.textButton}
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'new' ? styles.active : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
      </div>

      <div className={styles.notificationList}>
        {displayedNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <p>{activeTab === 'new' ? 'No new notifications' : 'No notifications yet'}</p>
          </div>
        ) : (
          displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className={styles.footer}>
          <button
            className={styles.clearButton}
            onClick={clearAll}
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  )
}