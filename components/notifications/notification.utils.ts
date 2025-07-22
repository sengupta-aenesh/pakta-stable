import { Notification } from './notification.types'

// Toast to Notification adapter
export function toastToNotification(
  message: string, 
  type: 'success' | 'error' | 'info' = 'info'
): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  // Extract title from message if it contains a separator
  let title = 'Notification'
  let body = message
  
  // Common patterns for extracting title
  if (message.includes(':')) {
    const parts = message.split(':')
    title = parts[0].trim()
    body = parts.slice(1).join(':').trim()
  } else if (message.includes('!')) {
    // For success messages like "Contract created successfully!"
    title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'
    body = message
  } else {
    // Default titles based on type
    switch (type) {
      case 'success':
        title = 'Success'
        break
      case 'error':
        title = 'Error'
        break
      default:
        title = 'Info'
    }
    body = message
  }
  
  // Determine category based on message content
  let category: 'analysis' | 'system' | 'file' | 'user' = 'system'
  
  if (message.toLowerCase().includes('analysis') || 
      message.toLowerCase().includes('analyzing') ||
      message.toLowerCase().includes('risk')) {
    category = 'analysis'
  } else if (message.toLowerCase().includes('file') || 
             message.toLowerCase().includes('upload') ||
             message.toLowerCase().includes('delete') ||
             message.toLowerCase().includes('move') ||
             message.toLowerCase().includes('copy')) {
    category = 'file'
  } else if (message.toLowerCase().includes('user') ||
             message.toLowerCase().includes('login') ||
             message.toLowerCase().includes('logout') ||
             message.toLowerCase().includes('account')) {
    category = 'user'
  }
  
  return {
    type,
    title,
    message: body,
    metadata: { category }
  }
}

// Create specific notification helpers
export const notificationHelpers = {
  analysisStarted: (documentType: 'contract' | 'template', id: string) => ({
    type: 'info' as const,
    title: `${documentType === 'contract' ? 'Contract' : 'Template'} Analysis Started`,
    message: 'AI analysis is in progress. This may take a few moments.',
    metadata: {
      category: 'analysis' as const,
      [`${documentType}Id`]: id
    }
  }),
  
  analysisCompleted: (
    documentType: 'contract' | 'template', 
    id: string, 
    risksFound: number,
    duplicatesFiltered?: number
  ) => ({
    type: 'success' as const,
    title: 'Analysis Complete',
    message: duplicatesFiltered 
      ? `Found ${risksFound} risks. Smart filtering removed ${duplicatesFiltered} duplicate${duplicatesFiltered !== 1 ? 's' : ''}.`
      : `Analysis completed successfully. Found ${risksFound} risk${risksFound !== 1 ? 's' : ''}.`,
    metadata: {
      category: 'analysis' as const,
      [`${documentType}Id`]: id
    },
    action: {
      label: 'View Results',
      onClick: () => {
        window.location.href = `/${documentType}-dashboard?${documentType}Id=${id}`
      }
    }
  }),
  
  analysisFailed: (documentType: 'contract' | 'template', error?: string) => ({
    type: 'error' as const,
    title: 'Analysis Failed',
    message: error || 'An error occurred during analysis. Please try again.',
    metadata: {
      category: 'analysis' as const
    }
  }),
  
  fileUploaded: (fileName: string, type: 'contract' | 'template') => ({
    type: 'success' as const,
    title: 'File Uploaded',
    message: `${fileName} has been uploaded successfully as a ${type}.`,
    metadata: {
      category: 'file' as const
    }
  }),
  
  fileDeleted: (fileName: string) => ({
    type: 'success' as const,
    title: 'File Deleted',
    message: `${fileName} has been deleted.`,
    metadata: {
      category: 'file' as const
    }
  }),
  
  fileMoved: (fileName: string, folderName: string) => ({
    type: 'success' as const,
    title: 'File Moved',
    message: `${fileName} has been moved to ${folderName}.`,
    metadata: {
      category: 'file' as const
    }
  }),
  
  riskResolved: (riskCategory: string) => ({
    type: 'success' as const,
    title: 'Risk Resolved',
    message: `${riskCategory} risk has been marked as resolved.`,
    metadata: {
      category: 'analysis' as const
    }
  }),
  
  versionCreated: (versionName: string) => ({
    type: 'success' as const,
    title: 'Version Created',
    message: `Template version "${versionName}" has been created successfully.`,
    metadata: {
      category: 'file' as const
    }
  })
}

// Format notification groups for display
export function groupNotificationsByDate(notifications: Notification[]) {
  const groups: { [key: string]: Notification[] } = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  notifications.forEach(notification => {
    const notifDate = new Date(notification.timestamp)
    let groupKey = ''
    
    if (isToday(notifDate)) {
      groupKey = 'Today'
    } else if (isYesterday(notifDate)) {
      groupKey = 'Yesterday'
    } else if (isThisWeek(notifDate)) {
      groupKey = 'This Week'
    } else {
      groupKey = 'Older'
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(notification)
  })
  
  return groups
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
}

function isThisWeek(date: Date): boolean {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  return date > weekAgo
}