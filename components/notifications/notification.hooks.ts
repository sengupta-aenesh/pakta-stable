import { useCallback } from 'react'
import { useNotifications } from './NotificationProvider'
import { toastToNotification } from './notification.utils'

// Backward compatible hook that mimics useToast but uses notifications
export function useToast() {
  const { notify } = useNotifications()
  
  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = toastToNotification(message, type)
    notify(notification)
  }, [notify])
  
  // Return the same interface as the old useToast
  // but toasts array and removeToast are no longer needed
  return {
    toast,
    toasts: [], // Empty array for compatibility
    removeToast: () => {} // No-op for compatibility
  }
}

// New enhanced notification hook with more features
export function useEnhancedNotifications() {
  const context = useNotifications()
  
  // Quick notification methods
  const success = useCallback((title: string, message?: string) => {
    context.notify({
      type: 'success',
      title,
      message: message || title
    })
  }, [context])
  
  const error = useCallback((title: string, message?: string) => {
    context.notify({
      type: 'error',
      title,
      message: message || title
    })
  }, [context])
  
  const info = useCallback((title: string, message?: string) => {
    context.notify({
      type: 'info',
      title,
      message: message || title
    })
  }, [context])
  
  const warning = useCallback((title: string, message?: string) => {
    context.notify({
      type: 'warning',
      title,
      message: message || title
    })
  }, [context])
  
  return {
    ...context,
    success,
    error,
    info,
    warning
  }
}