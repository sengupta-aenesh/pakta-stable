'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Contract, contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { Button, Textarea, TopNavigation } from '@/components/ui'
import { foldersApi, Folder } from '@/lib/folders-api'
import UnifiedSidebar from '@/components/folders/unified-sidebar'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import styles from './contract-creator.module.css'

interface Message {
  role: 'human' | 'ai'
  content: string
}

export default function ContractCreatorPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingStatus, setStreamingStatus] = useState<{agent: string, status: string} | null>(null)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [contractCompleted, setContractCompleted] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<string | null>(null)
  const [editableFields, setEditableFields] = useState<any[]>([])
  const [suggestedTerms, setSuggestedTerms] = useState<any[]>([])
  const [showSuggestedTerms, setShowSuggestedTerms] = useState(false)
  const [fallbackTerms, setFallbackTerms] = useState<any[]>([])
  const [showFallbackTerms, setShowFallbackTerms] = useState(false)
  const [contractId, setContractId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const notifications = useEnhancedNotifications()
  const { notify } = notifications

  useEffect(() => {
    loadUserAndData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'ai',
        content: 'Hi! I\'m your AI contract assistant powered by advanced reasoning models and intelligent agents. What type of contract or agreement would you like to create today?'
      }])
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadUserAndData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      await Promise.all([
        loadContracts(currentUser.id),
        loadFolders(currentUser.id)
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      notifications.error('Operation Failed', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function loadContracts(userId: string) {
    const userContracts = await contractsApi.getAll(userId)
    setContracts(userContracts)
  }

  async function loadFolders(userId: string) {
    try {
      const userFolders = await foldersApi.getAll(userId)
      setFolders(userFolders)
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  async function handleSignOut() {
    const { signOut } = await import('@/lib/auth-client')
    await signOut()
    router.push('/auth/login')
  }

  async function handleContractClick(contract: Contract) {
    router.push(`/dashboard?contractId=${contract.id}`)
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || chatLoading) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setChatLoading(true)
    setStreamingStatus(null)
    setActiveAgent(null)

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'human', content: userMessage }])

    try {
      // Try streaming first
      const response = await fetch('/api/contract/create-intelligent-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          streaming: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    if (data.type === 'thinking') {
                      setStreamingStatus({ agent: data.data.agent, status: data.data.status })
                    }
                    
                    if (data.type === 'agent') {
                      setActiveAgent(data.data.name)
                    }
                    
                    if (data.type === 'status') {
                      setStreamingStatus({ agent: 'System', status: data.data.message })
                    }
                    
                    if (data.type === 'response') {
                      // Update session ID if new
                      if (!sessionId && data.data.sessionId) {
                        setSessionId(data.data.sessionId)
                      }
                      
                      // Add AI response to messages
                      setMessages(prev => [...prev, { role: 'ai', content: data.data.message }])
                      setStreamingStatus(null)
                      setActiveAgent(null)
                    }
                    
                    if (data.type === 'complete') {
                      // Handle contract completion
                      setContractCompleted(true)
                      if (data.data.contractId) {
                        setContractId(data.data.contractId)
                      }
                      if (data.data.contractDraft) {
                        setGeneratedContract(data.data.contractDraft)
                      }
                      setEditableFields([])
                      setShowSuggestedTerms(false)
                      setShowFallbackTerms(false)
                      setMessages(prev => [...prev, { role: 'ai', content: data.data.message }])
                      setStreamingStatus(null)
                      setActiveAgent(null)
                      notifications.success('Success', 'Contract created successfully!')
                    }
                    
                    if (data.type === 'error') {
                      throw new Error(data.data.message)
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
      } else {
        // Fallback to regular JSON response
        const data = await response.json()
        
        // Update session ID if new
        if (!sessionId && data.session?.id) {
          setSessionId(data.session.id)
        }

        // Add AI response to messages
        if (data.session?.messages) {
          const lastMessage = data.session.messages[data.session.messages.length - 1]
          if (lastMessage && lastMessage.role === 'ai') {
            setMessages(prev => [...prev, { role: 'ai', content: lastMessage.content }])
          }
        }

        // Handle contract completion
        if (data.completed && data.contractId) {
          setContractCompleted(true)
          setContractId(data.contractId)
          setGeneratedContract(data.session.generatedContract)
          setEditableFields(data.session.editableFields || [])
          setShowSuggestedTerms(false)
          setShowFallbackTerms(false)
          notifications.success('Success', 'Contract created successfully!')
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      notifications.error('Operation Failed', 'Failed to send message. Please try again.')
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
      setStreamingStatus(null)
      setActiveAgent(null)
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleViewContract = () => {
    if (contractId) {
      router.push(`/dashboard?contractId=${contractId}`)
    }
  }

  const handleQuickMessage = async (message: string) => {
    if (chatLoading) return
    
    setChatLoading(true)
    setStreamingStatus(null)
    setActiveAgent(null)
    
    // Clear suggested terms panel when user includes them
    if (message.toLowerCase().includes('include all')) {
      setShowSuggestedTerms(false)
      setShowFallbackTerms(false)
    }

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'human', content: message }])

    try {
      // Try streaming first
      const response = await fetch('/api/contract/create-intelligent-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: message,
          streaming: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    if (data.type === 'thinking') {
                      setStreamingStatus({ agent: data.data.agent, status: data.data.status })
                    }
                    
                    if (data.type === 'agent') {
                      setActiveAgent(data.data.name)
                    }
                    
                    if (data.type === 'status') {
                      setStreamingStatus({ agent: 'System', status: data.data.message })
                    }
                    
                    if (data.type === 'response') {
                      // Update session ID if new
                      if (!sessionId && data.data.sessionId) {
                        setSessionId(data.data.sessionId)
                      }
                      
                      // Add AI response to messages
                      setMessages(prev => [...prev, { role: 'ai', content: data.data.message }])
                      setStreamingStatus(null)
                      setActiveAgent(null)
                    }
                    
                    if (data.type === 'complete') {
                      // Handle contract completion
                      setContractCompleted(true)
                      if (data.data.contractId) {
                        setContractId(data.data.contractId)
                      }
                      if (data.data.contractDraft) {
                        setGeneratedContract(data.data.contractDraft)
                      }
                      setEditableFields([])
                      setShowSuggestedTerms(false)
                      setShowFallbackTerms(false)
                      setMessages(prev => [...prev, { role: 'ai', content: data.data.message }])
                      setStreamingStatus(null)
                      setActiveAgent(null)
                      notifications.success('Success', 'Contract created successfully!')
                    }
                    
                    if (data.type === 'error') {
                      throw new Error(data.data.message)
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
      } else {
        // Fallback to regular JSON response
        const data = await response.json()
        
        // Update session ID if new
        if (!sessionId && data.session?.id) {
          setSessionId(data.session.id)
        }

        // Add AI response to messages
        if (data.session?.messages) {
          const lastMessage = data.session.messages[data.session.messages.length - 1]
          if (lastMessage && lastMessage.role === 'ai') {
            setMessages(prev => [...prev, { role: 'ai', content: lastMessage.content }])
          }
        }

        // Handle contract completion
        if (data.completed && data.contractId) {
          setContractCompleted(true)
          setContractId(data.contractId)
          setGeneratedContract(data.session.generatedContract)
          setEditableFields(data.session.editableFields || [])
          setShowSuggestedTerms(false)
          setShowFallbackTerms(false)
          notifications.success('Success', 'Contract created successfully!')
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      notifications.error('Operation Failed', 'Failed to send message. Please try again.')
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
      setStreamingStatus(null)
      setActiveAgent(null)
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className={styles.creatorLayout}>
      {/* iOS-Style Top Navigation */}
      <TopNavigation 
        currentPage="create" 
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Left Sidebar - Folder Tree */}
      <div>
        <UnifiedSidebar
          folders={folders}
          contracts={contracts}
          selectedFolder={null}
          onSelectFolder={() => {}}
          onFoldersUpdate={() => loadFolders(user.id)}
          onContractsUpdate={() => loadContracts(user.id)}
          onContractClick={handleContractClick}
          user={user}
          showUserSection={true}
          onSignOut={handleSignOut}
          // Notification system is used internally
        />
      </div>

      {/* Main Content - Chat Interface */}
      <div className={styles.mainContent}>
        <div className={styles.chatContainer}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>AI Contract Creator</h1>
              <p className={styles.pageSubtitle}>Create professional contracts with advanced AI reasoning and legal research</p>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.messageWrapper} ${
                  message.role === 'human' ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    {message.content}
                  </div>
                  {/* Show contract actions if this is the final contract creation message */}
                  {message.role === 'ai' && contractCompleted && index === messages.length - 1 && contractId && (
                    <div className={styles.contractActions}>
                      <button
                        onClick={handleViewContract}
                        className={styles.contractActionButton}
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Open in Editor
                      </button>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className={`${styles.contractActionButton} ${styles.contractActionSecondary}`}
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                          <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"/>
                        </svg>
                        View All Contracts
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    <div className={styles.typingIndicator}>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      {streamingStatus ? (
                        <div>
                          <div style={{ color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '14px' }}>
                            {streamingStatus.agent}
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            {streamingStatus.status}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)' }}>AI legal team is working...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe the contract you need (e.g., 'I need an employment contract for a software developer position')"
                className={styles.messageInput}
                disabled={chatLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || chatLoading}
                className={styles.sendButton}
              >
                Send
              </Button>
            </div>
            <div className={styles.inputHint}>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Terms Panel */}
      {showFallbackTerms && fallbackTerms.length > 0 && (
        <div className={styles.suggestedTermsPanel}>
          <div className={styles.suggestedTermsHeader}>
            <h3 className={styles.suggestedTermsTitle}>⚖️ Suggested Terms for Missing Information</h3>
            <button 
              onClick={() => setShowFallbackTerms(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.suggestedTermsContent}>
            <div className={styles.fallbackExplanation}>
              Since you mentioned you don't have specific details for some areas, I've prepared user-favorable terms that protect your interests:
            </div>
            
            {fallbackTerms.map((term, index) => (
              <div key={index} className={styles.fallbackTermCard}>
                <h4 className={styles.termName}>📋 {term.missingItem}</h4>
                <div className={styles.suggestedClause}>
                  <strong>Suggested Term:</strong> {term.suggestedTerm}
                </div>
                <div className={styles.termReasoning}>
                  <strong>Why this protects you:</strong> {term.reasoning}
                </div>
                <div className={styles.userBenefit}>
                  <strong>Your benefit:</strong> {term.userBenefit}
                </div>
              </div>
            ))}
            
            <div className={styles.suggestedTermsActions}>
              <Button
                variant="primary"
                onClick={() => handleQuickMessage("Yes, please use these suggested terms")}
                size="sm"
                disabled={chatLoading}
              >
                ✅ Use These Terms
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleQuickMessage("No, I'd prefer to skip these suggestions")}
                size="sm"
                disabled={chatLoading}
              >
                ❌ Skip These
              </Button>
            </div>
            
            <div className={styles.helpText}>
              💡 These terms are designed to favor your position where specific information wasn't available. You can always modify them later!
            </div>
          </div>
        </div>
      )}

      {/* Suggested Terms Panel */}
      {showSuggestedTerms && suggestedTerms.length > 0 && !showFallbackTerms && (
        <div className={styles.suggestedTermsPanel}>
          <div className={styles.suggestedTermsHeader}>
            <h3 className={styles.suggestedTermsTitle}>💡 Suggested Terms</h3>
            <button 
              onClick={() => setShowSuggestedTerms(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.suggestedTermsContent}>
            {suggestedTerms.map((term, index) => (
              <div key={index} className={styles.termCard}>
                <h4 className={styles.termName}>{term.term}</h4>
                <p className={styles.termDescription}>{term.description}</p>
                <p className={styles.termImportance}>
                  <strong>Why it's important:</strong> {term.importance}
                </p>
                <p className={styles.termExample}>
                  <strong>Example:</strong> {term.example}
                </p>
              </div>
            ))}
            
            <div className={styles.suggestedTermsActions}>
              <Button
                variant="primary"
                onClick={() => handleQuickMessage("Include all suggested terms in my contract")}
                size="sm"
                disabled={chatLoading}
              >
                Include All Terms
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleQuickMessage("Show me more suggested terms for this contract type")}
                size="sm"
                disabled={chatLoading}
              >
                More Suggestions
              </Button>
            </div>
            
            <div className={styles.helpText}>
              💡 Need clarification on any legal terms? Just ask "What does [term] mean?" in the chat!
            </div>
          </div>
        </div>
      )}


      {/* Render toasts */}
      {/* Toasts are now handled by the notification system */}
    </div>
  )
}