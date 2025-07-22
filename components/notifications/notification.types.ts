export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  metadata?: {
    contractId?: string
    templateId?: string
    analysisId?: string
    category?: 'analysis' | 'system' | 'file' | 'user'
  }
}

export interface NotificationPreferences {
  soundEnabled: boolean
  desktopEnabled: boolean
  emailEnabled: boolean
  categories: {
    analysis: boolean
    system: boolean
    file: boolean
    user: boolean
  }
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences
  notify: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
}