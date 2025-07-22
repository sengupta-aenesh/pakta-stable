'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Notification, NotificationContextType, NotificationPreferences } from './notification.types'

const NotificationContext = createContext<NotificationContextType | null>(null)

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  desktopEnabled: false,
  emailEnabled: false,
  categories: {
    analysis: true,
    system: true,
    file: true,
    user: true
  }
}

const STORAGE_KEY = 'contract-manager-notifications'
const PREFERENCES_KEY = 'contract-manager-notification-preferences'
const MAX_NOTIFICATIONS = 100
const NOTIFICATION_SOUND = '/sounds/notification.mp3' // We'll add this sound file later

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)

  // Load notifications and preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(notificationsWithDates)
      }

      const storedPrefs = localStorage.getItem(PREFERENCES_KEY)
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs))
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error('Failed to save notifications to storage:', error)
    }
  }, [notifications])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences to storage:', error)
    }
  }, [preferences])

  const playNotificationSound = useCallback(() => {
    if (preferences.soundEnabled && typeof window !== 'undefined') {
      try {
        const audio = new Audio(NOTIFICATION_SOUND)
        audio.volume = 0.5
        audio.play().catch(e => console.warn('Could not play notification sound:', e))
      } catch (error) {
        console.warn('Notification sound not available:', error)
      }
    }
  }, [preferences.soundEnabled])

  const notify = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    // Check if category is enabled
    const category = notification.metadata?.category || 'system'
    if (!preferences.categories[category]) {
      return // Don't show notification if category is disabled
    }

    setNotifications(prev => {
      // Keep only the most recent notifications
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      return updated
    })

    // Play sound for new notifications
    playNotificationSound()

    // Show desktop notification if enabled
    if (preferences.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icon-192x192.png', // Add your app icon
          tag: newNotification.id
        })
      } catch (error) {
        console.warn('Desktop notification failed:', error)
      }
    }
  }, [preferences, playNotificationSound])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs,
      categories: {
        ...prev.categories,
        ...(newPrefs.categories || {})
      }
    }))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    notify,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}