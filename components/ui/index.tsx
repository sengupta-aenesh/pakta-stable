'use client'

import React from 'react'

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled,
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" style={{ marginRight: '8px' }} />}
      {children}
    </button>
  )
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`input ${className}`}
      {...props}
    />
  )
}

// Label Component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
    </label>
  )
}

// Card Components
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  )
}

// Alert Component
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning'
  children: React.ReactNode
}

export function Alert({ variant = 'error', children, className = '', ...props }: AlertProps) {
  return (
    <div className={`alert alert-${variant} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning'
  children: React.ReactNode
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  )
}

// Risk Dot Component
interface RiskDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: 'high' | 'medium' | 'low'
}

export function RiskDot({ level, className = '', ...props }: RiskDotProps) {
  return (
    <span className={`risk-dot risk-${level} ${className}`} {...props} />
  )
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`input ${className}`}
      {...props}
    />
  )
}

// Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

export function Skeleton({ width = '100%', height = '20px', className = '', ...props }: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ width, height }}
      {...props} 
    />
  )
}

// Tabs Components
interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, children, className = '', ...props }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`tabs-list ${className}`} {...props}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

export function TabsTrigger({ value, children, className = '', ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isActive = context.activeTab === value
  
  return (
    <button
      className={`tab-trigger ${isActive ? 'active' : ''} ${className}`}
      onClick={() => context.setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

export function TabsContent({ value, children, className = '', ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.activeTab !== value) return null
  
  return (
    <div className={`tab-content ${className}`} {...props}>
      {children}
    </div>
  )
}

// Toast Component (simplified)
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  const bgColor = {
    success: '#F0FDF4',
    error: '#FEF2F2',
    info: '#EFF6FF'
  }[type]
  
  const textColor = {
    success: '#16A34A',
    error: '#DC2626',
    info: '#0066FF'
  }[type]
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000
    }}>
      {message}
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0
        }}
      >
        ×
      </button>
    </div>
  )
}

// TopNavigation export
export { default as TopNavigation } from './top-navigation'

// ConfirmationDialog export
export { default as ConfirmationDialog } from './confirmation-dialog'

// Re-export notification hooks for backward compatibility
export { useToast } from '@/components/notifications/notification.hooks'
export { useEnhancedNotifications } from '@/components/notifications/notification.hooks'