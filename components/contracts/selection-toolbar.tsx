'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './selection-toolbar.module.css'

interface SelectionToolbarProps {
  selectedText: string
  position: { x: number; y: number }
  onExplain: (text: string) => Promise<string>
  onRedraft: (text: string) => Promise<{ originalText: string; redraftedText: string; explanation: string; onAccept: () => void; onReject: () => void }>
  onClose: () => void
  isVisible: boolean
}

type ToolbarMode = 'default' | 'explain' | 'redraft'

interface ExplanationData {
  explanation: string
  loading: boolean
  error?: string
}

interface RedraftData {
  originalText: string
  redraftedText: string
  explanation: string
  loading: boolean
  error?: string
  onAccept?: () => void
  onReject?: () => void
}

export default function SelectionToolbar({
  selectedText,
  position,
  onExplain,
  onRedraft,
  onClose,
  isVisible
}: SelectionToolbarProps) {
  const [mode, setMode] = useState<ToolbarMode>('default')
  
  // Debug mode changes
  useEffect(() => {
    console.log('Toolbar mode changed to:', mode)
    console.log('Stack trace for mode change:', new Error().stack)
  }, [mode])
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null)
  const [redraftData, setRedraftData] = useState<RedraftData | null>(null)
  const [fixedPosition, setFixedPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Enhanced utility function to beautify AI response text
  const beautifyResponse = (text: string): string => {
    if (!text || typeof text !== 'string') return ''
    
    return text
      // First, normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      
      // Clean up any remaining markdown that might slip through
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Remove bold+italic ***text***
      .replace(/\*\*(.*?)\*\*/g, '$1')      // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')          // Remove italic *text*
      .replace(/_{3}(.*?)_{3}/g, '$1')      // Remove bold+italic ___text___
      .replace(/_{2}(.*?)_{2}/g, '$1')      // Remove bold __text__
      .replace(/_(.*?)_/g, '$1')            // Remove italic _text_
      .replace(/~~(.*?)~~/g, '$1')          // Remove strikethrough ~~text~~
      .replace(/^#{1,6}\s+(.*?)#*$/gm, '$1') // Remove headers
      .replace(/`{3}[\s\S]*?`{3}/g, '')     // Remove code blocks
      .replace(/`(.*?)`/g, '$1')            // Remove inline code
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links but keep text
      
      // Normalize list formatting
      .replace(/^\s*[-*+]\s+/gm, '• ')      // Convert various bullet styles to consistent •
      .replace(/^\s*(\d+)[.)]\s+/gm, '$1. ') // Normalize numbered lists
      
      // Improve paragraph and line breaks - be more aggressive about separating numbered points
      .replace(/(\d+\.\s[^\n]*?)(?=\s*\d+\.)/g, '$1\n\n') // Add breaks between numbered items
      .replace(/(•\s[^\n]*?)(?=\s*•)/g, '$1\n\n')         // Add breaks between bullet items
      
      // Better paragraph separation - add breaks after periods when followed by numbers or bullets
      .replace(/([.!?])\s*(\d+\.\s)/g, '$1\n\n$2')       // Break before numbered points
      .replace(/([.!?])\s*(•\s)/g, '$1\n\n$2')           // Break before bullet points
      
      // Clean up multiple line breaks but preserve intentional spacing
      .replace(/\n\s*\n\s*\n+/g, '\n\n')    // Collapse 3+ line breaks to 2
      
      // Clean up whitespace
      .replace(/[ \t]+/g, ' ')               // Multiple spaces to single
      .replace(/\n[ \t]+/g, '\n')            // Remove leading spaces from lines
      .replace(/[ \t]+\n/g, '\n')            // Remove trailing spaces from lines
      
      // Final cleanup
      .replace(/^\s+|\s+$/g, '')             // Trim start and end
      .replace(/\n{3,}/g, '\n\n')            // Ensure max 2 line breaks
      
      .trim()
  }

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Don't close if clicking within the toolbar
      if (toolbarRef.current && toolbarRef.current.contains(target)) {
        return
      }
      
      
      // Don't close if we're in explain or redraft modes with loading/content
      if ((mode === 'explain' && explanationData?.loading) || 
          (mode === 'redraft' && redraftData?.loading)) {
        return
      }
      
      // Only close from default mode
      if (mode === 'default') {
        onClose()
      }
    }

    // Use a small delay to ensure the toolbar has rendered
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose, mode, explanationData?.loading, redraftData?.loading])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('Escape pressed, current mode:', mode)
        onClose()
      } else if (event.key === 'e' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleExplain()
      } else if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleRedraft()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, mode])

  // Handle dragging functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !fixedPosition) return
      
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep toolbar within viewport bounds
      const toolbarWidth = mode === 'default' ? 340 : 520
      const toolbarHeight = 120 // Estimated height
      const padding = 20
      
      const constrainedX = Math.max(padding, Math.min(newX, window.innerWidth - toolbarWidth - padding))
      const constrainedY = Math.max(padding, Math.min(newY, window.innerHeight - toolbarHeight - padding))
      
      setFixedPosition({ x: constrainedX, y: constrainedY })
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, dragOffset, fixedPosition, mode])

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fixedPosition) return
    
    const rect = toolbarRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    e.preventDefault()
  }

  // Calculate position when isVisible becomes true (only if not dragged)
  useEffect(() => {
    if (isVisible && position.x > 0 && position.y > 0 && !fixedPosition) {
      console.log('Calculating initial position for toolbar with position:', position)
      // Calculate position when toolbar becomes visible
      const toolbarWidth = 340 // Default width
      const toolbarHeight = 120 // Default height estimate
      const padding = 20
      
      const calculatedPosition = {
        x: Math.max(padding, Math.min(position.x, window.innerWidth - toolbarWidth - padding)),
        y: (() => {
          // Try to position above the selection first
          const abovePosition = position.y - toolbarHeight - 20
          if (abovePosition >= padding) {
            return abovePosition
          }
          
          // If not enough space above, position below
          const belowPosition = position.y + 40
          if (belowPosition + toolbarHeight <= window.innerHeight - padding) {
            return belowPosition
          }
          
          // If not enough space below either, center vertically with padding
          return Math.max(padding, Math.min(
            window.innerHeight - toolbarHeight - padding,
            (window.innerHeight - toolbarHeight) / 2
          ))
        })()
      }
      
      console.log('Setting initial fixed position:', calculatedPosition)
      setFixedPosition(calculatedPosition)
    } else if (!isVisible) {
      setFixedPosition(null)
    }
  }, [isVisible, position, fixedPosition])

  // Initialize state only when component first mounts
  useEffect(() => {
    console.log('SelectionToolbar mounted')
    // Don't reset mode - let it stay as initialized
    // Only clear data states
    setExplanationData(null)
    setRedraftData(null)
  }, []) // Empty dependency array - only run once on mount



  const handleExplain = async () => {
    console.log('HandleExplain called, switching to explain mode')
    setMode('explain')
    setExplanationData({ explanation: '', loading: true })
    
    try {
      console.log('Calling onExplain with text:', selectedText)
      const explanation = await onExplain(selectedText)
      console.log('Received explanation:', explanation)
      
      const cleanedExplanation = beautifyResponse(explanation)
      console.log('Cleaned explanation:', cleanedExplanation)
      
      setExplanationData({ 
        explanation: cleanedExplanation, 
        loading: false 
      })
      console.log('Updated explanationData state')
    } catch (error) {
      console.error('Error in handleExplain:', error)
      setExplanationData({ 
        explanation: '', 
        loading: false, 
        error: 'Failed to get explanation' 
      })
    }
  }

  const handleRedraft = async () => {
    console.log('HandleRedraft called, switching to redraft mode')
    setMode('redraft')
    setRedraftData({ 
      originalText: selectedText,
      redraftedText: '',
      explanation: '',
      loading: true 
    })
    
    try {
      console.log('Calling onRedraft with text:', selectedText)
      const redraftResult = await onRedraft(selectedText)
      console.log('Received redraft result:', redraftResult)
      
      const cleanedExplanation = beautifyResponse(redraftResult.explanation)
      const cleanedRedraftedText = beautifyResponse(redraftResult.redraftedText)
      
      console.log('🔍 Redraft data received:', {
        originalText: redraftResult.originalText?.substring(0, 100) + '...',
        redraftedText: redraftResult.redraftedText?.substring(0, 100) + '...',
        explanation: redraftResult.explanation?.substring(0, 100) + '...'
      })
      console.log('🧹 Cleaned redraft explanation:', cleanedExplanation.substring(0, 100) + '...')
      console.log('🧹 Cleaned redrafted text:', cleanedRedraftedText.substring(0, 100) + '...')
      
      setRedraftData({ 
        originalText: redraftResult.originalText,
        redraftedText: cleanedRedraftedText,
        explanation: cleanedExplanation,
        loading: false,
        onAccept: redraftResult.onAccept,
        onReject: redraftResult.onReject
      })
      console.log('Updated redraftData state')
    } catch (error) {
      console.error('Error in handleRedraft:', error)
      setRedraftData({ 
        originalText: selectedText,
        redraftedText: '',
        explanation: '',
        loading: false, 
        error: 'Failed to get redraft suggestion' 
      })
    }
  }


  const handleBackToDefault = () => {
    setMode('default')
    setExplanationData(null)
    setRedraftData(null)
  }

  if (!isVisible || !selectedText.trim() || !fixedPosition) {
    console.log('SelectionToolbar not rendering:', { isVisible, hasSelectedText: !!selectedText.trim(), hasFixedPosition: !!fixedPosition })
    return null
  }

  console.log('SelectionToolbar rendering with mode:', mode, 'explanationData:', explanationData, 'redraftData:', redraftData)

  return (
    <div
      ref={toolbarRef}
      className={`${styles.toolbar} ${styles[mode]} selection-toolbar`}
      data-toolbar="selection-toolbar"
      style={{
        left: fixedPosition.x,
        top: fixedPosition.y,
        position: 'fixed',
        zIndex: 1000
      }}
    >
      {/* Drag handle */}
      <div 
        className={styles.dragHandle}
        onMouseDown={handleMouseDown}
        title="Drag to move toolbar"
      />
      
      {/* Header with selected text */}
      <div className={styles.header}>
        <div className={styles.selectedTextPreview}>
          <span className={styles.previewText}>
            "{selectedText.length > 60 ? selectedText.substring(0, 60) + '...' : selectedText}"
          </span>
          <span className={styles.textLength}>
            {selectedText.length} chars
          </span>
        </div>
      </div>

      {/* Content based on mode */}
      {mode === 'default' && (
        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${styles.explainButton}`}
            onClick={handleExplain}
            title="AI Explain (Ctrl+E)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            Explain
          </button>

          <button
            className={`${styles.actionButton} ${styles.redraftButton}`}
            onClick={handleRedraft}
            title="AI Redraft (Ctrl+R)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Redraft
          </button>
        </div>
      )}

      {mode === 'explain' && (
        <div className={styles.explainMode}>
          <div className={styles.backButton}>
            <button onClick={handleBackToDefault} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m7-7l-7 7 7 7"/>
              </svg>
              Back
            </button>
          </div>
          
          <div className={styles.explainContent}>
            {explanationData?.loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>AI is analyzing the legal text...</span>
              </div>
            ) : explanationData?.error ? (
              <div className={styles.error}>
                <span>❌ {explanationData.error}</span>
              </div>
            ) : explanationData?.explanation ? (
              <div className={styles.explanation}>
                <h4>AI Legal Analysis</h4>
                <div className={styles.explanationText}>
                  {explanationData.explanation.split('\n\n').filter(p => p.trim()).map((paragraph, index) => {
                    const trimmedParagraph = paragraph.trim()
                    
                    // Handle bullet points specially
                    if (trimmedParagraph.startsWith('• ')) {
                      return (
                        <div key={index} style={{ 
                          marginBottom: '12px', 
                          paddingLeft: '0',
                          lineHeight: '1.6',
                          fontSize: '13px',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <span style={{ 
                            marginRight: '8px', 
                            color: '#059669', 
                            fontWeight: '600',
                            flexShrink: 0 
                          }}>•</span>
                          <span style={{ flex: 1 }}>{trimmedParagraph.substring(2).trim()}</span>
                        </div>
                      )
                    }
                    
                    // Handle numbered lists - improved pattern matching
                    const numberedMatch = trimmedParagraph.match(/^(\d+)\.\s+(.*)$/s)
                    if (numberedMatch) {
                      return (
                        <div key={index} style={{ 
                          marginBottom: '12px', 
                          paddingLeft: '0',
                          lineHeight: '1.6',
                          fontSize: '13px',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <span style={{ 
                            marginRight: '8px', 
                            color: '#0284c7', 
                            fontWeight: '600', 
                            minWidth: '24px',
                            flexShrink: 0 
                          }}>
                            {numberedMatch[1]}.
                          </span>
                          <span style={{ flex: 1 }}>{numberedMatch[2].trim()}</span>
                        </div>
                      )
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={index} style={{ 
                        marginBottom: '12px', 
                        lineHeight: '1.6',
                        fontSize: '13px',
                        color: '#374151',
                        margin: '0 0 12px 0'
                      }}>
                        {trimmedParagraph}
                      </p>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Getting explanation...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'redraft' && (
        <div className={styles.redraftMode}>
          <div className={styles.backButton}>
            <button onClick={handleBackToDefault} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m7-7l-7 7 7 7"/>
              </svg>
              Back
            </button>
          </div>
          
          <div className={styles.redraftContent}>
            {redraftData?.loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>AI is redrafting the text...</span>
              </div>
            ) : redraftData?.error ? (
              <div className={styles.error}>
                <span>❌ {redraftData.error}</span>
              </div>
            ) : redraftData?.redraftedText ? (
              <div className={styles.comparison}>
                <div className={styles.originalText}>
                  <h4>Original</h4>
                  <div className={styles.textContent}>
                    {redraftData.originalText}
                  </div>
                </div>
                
                <div className={styles.redraftedText}>
                  <h4>AI Suggestion</h4>
                  <div className={styles.textContent}>
                    {redraftData.redraftedText}
                  </div>
                </div>
                
                {redraftData.explanation && (
                  <div className={styles.redraftExplanation}>
                    <h4>Changes Made</h4>
                    <div style={{ lineHeight: '1.6' }}>
                      {redraftData.explanation.split('\n\n').filter(p => p.trim()).map((paragraph, index) => {
                        const trimmedParagraph = paragraph.trim()
                        
                        // Handle bullet points specially
                        if (trimmedParagraph.startsWith('• ')) {
                          return (
                            <div key={index} style={{ 
                              marginBottom: '12px', 
                              paddingLeft: '0',
                              lineHeight: '1.6',
                              fontSize: '13px',
                              color: '#92400e',
                              display: 'flex',
                              alignItems: 'flex-start'
                            }}>
                              <span style={{ 
                                marginRight: '8px', 
                                color: '#d97706', 
                                fontWeight: '600',
                                flexShrink: 0 
                              }}>•</span>
                              <span style={{ flex: 1 }}>{trimmedParagraph.substring(2).trim()}</span>
                            </div>
                          )
                        }
                        
                        // Handle numbered lists - improved pattern matching
                        const numberedMatch = trimmedParagraph.match(/^(\d+)\.\s+(.*)$/s)
                        if (numberedMatch) {
                          return (
                            <div key={index} style={{ 
                              marginBottom: '12px', 
                              paddingLeft: '0',
                              lineHeight: '1.6',
                              fontSize: '13px',
                              color: '#92400e',
                              display: 'flex',
                              alignItems: 'flex-start'
                            }}>
                              <span style={{ 
                                marginRight: '8px', 
                                color: '#d97706', 
                                fontWeight: '600', 
                                minWidth: '24px',
                                flexShrink: 0 
                              }}>
                                {numberedMatch[1]}.
                              </span>
                              <span style={{ flex: 1 }}>{numberedMatch[2].trim()}</span>
                            </div>
                          )
                        }
                        
                        // Regular paragraphs
                        return (
                          <p key={index} style={{ 
                            marginBottom: '12px', 
                            lineHeight: '1.6',
                            fontSize: '13px',
                            color: '#92400e',
                            margin: '0 0 12px 0'
                          }}>
                            {trimmedParagraph}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className={styles.redraftActions}>
                  <button 
                    className={styles.acceptButton}
                    onClick={() => {
                      console.log('🎯 Accept button clicked')
                      if (redraftData?.onAccept) {
                        console.log('📝 Calling onAccept function')
                        redraftData.onAccept()
                        console.log('✅ onAccept completed')
                      }
                      // Don't call onClose here - let onAccept handle it
                    }}
                  >
                    Accept Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Getting redraft suggestion...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}