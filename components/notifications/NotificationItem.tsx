'use client'

import React from 'react'
import { useNotifications } from './NotificationProvider'
import { Notification } from './notification.types'
import styles from './notification.module.css'

interface NotificationItemProps {
  notification: Notification
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, removeNotification } = useNotifications()

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.action?.onClick) {
      notification.action.onClick()
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div 
      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${notification.action ? styles.clickable : ''}`}
      onClick={handleClick}
    >
      <div className={`${styles.icon} ${styles[notification.type]}`}>
        {getIcon()}
      </div>
      
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{notification.title}</h4>
          <span className={styles.time}>{formatTime(notification.timestamp)}</span>
        </div>
        
        <p className={styles.message}>{notification.message}</p>
        
        {notification.action && (
          <button className={styles.actionButton}>
            {notification.action.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
      
      <button
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation()
          removeNotification(notification.id)
        }}
        title="Remove notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}