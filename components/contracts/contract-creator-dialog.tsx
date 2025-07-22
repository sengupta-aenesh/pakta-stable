'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Card, CardBody, Input, Textarea } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'

interface Message {
  role: 'human' | 'ai'
  content: string
}

interface ContractCreatorDialogProps {
  isOpen: boolean
  onClose: () => void
  onContractCreated?: (contractId: string) => void
}

export function ContractCreatorDialog({ 
  isOpen, 
  onClose, 
  onContractCreated 
}: ContractCreatorDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [contractCompleted, setContractCompleted] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<string | null>(null)
  const [editableFields, setEditableFields] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const notifications = useEnhancedNotifications()
  const { notify } = notifications

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      setMessages([{
        role: 'ai',
        content: 'Hi! I\'m your AI contract assistant. I can help you create professional contracts from scratch. What type of contract would you like to create today?'
      }])
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setLoading(true)

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'human', content: userMessage }])

    try {
      const response = await fetch('/api/contract/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      const data = await response.json()
      
      // Update session ID if new
      if (!sessionId && data.session?.id) {
        setSessionId(data.session.id)
      }

      // Add AI response to messages
      if (data.session?.messages) {
        const lastMessage = data.session.messages[data.session.messages.length - 1]
        if (lastMessage && lastMessage._getType && lastMessage._getType() !== 'human') {
          setMessages(prev => [...prev, { role: 'ai', content: lastMessage.content }])
        }
      }

      // Handle contract completion
      if (data.completed && data.contractId) {
        setContractCompleted(true)
        setGeneratedContract(data.session.generatedContract)
        setEditableFields(data.session.editableFields || [])
        notifications.success('Success', 'Contract created successfully!')
        onContractCreated?.(data.contractId)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      notifications.error('Operation Failed', 'Failed to send message. Please try again.')
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetDialog = () => {
    setMessages([])
    setCurrentMessage('')
    setSessionId(null)
    setContractCompleted(false)
    setGeneratedContract(null)
    setEditableFields([])
  }

  const handleClose = () => {
    resetDialog()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Contract Creator
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Create professional contracts with AI assistance
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Messages */}
          <CardBody className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'human'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardBody>

          {/* Contract Preview (if completed) */}
          {contractCompleted && generatedContract && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium mb-3">Generated Contract Preview</h3>
              <div className="bg-white p-4 rounded-lg border max-h-40 overflow-y-auto">
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {generatedContract.substring(0, 500)}...
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="primary"
                  onClick={handleClose}
                  size="sm"
                >
                  View Full Contract
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setContractCompleted(false)
                    setMessages(prev => [...prev, {
                      role: 'ai',
                      content: 'Would you like to make any changes to the contract or create a different one?'
                    }])
                  }}
                  size="sm"
                >
                  Make Changes
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!contractCompleted && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe the contract you need (e.g., 'I need an employment contract for a software developer position')"
                    className="min-h-[60px] resize-none"
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || loading}
                  className="px-6"
                >
                  Send
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Render toasts */}
      {/* Toasts are now handled by the notification system */}
    </>
  )
}