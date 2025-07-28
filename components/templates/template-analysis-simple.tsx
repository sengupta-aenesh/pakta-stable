'use client'

import { useState, useEffect, useCallback } from 'react'
import { Template } from '@/lib/supabase-client'
import { Button } from '@/components/ui'
import styles from './template-analysis.module.css'

interface TemplateAnalysisProps {
  template: Template
  onTemplateUpdate: (template: Template) => void
  onVariablesUpdate?: (variables: any[]) => void
  onVersionCreate?: (variables: any[], versionName: string) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
  isEditMode?: boolean
}

export default function TemplateAnalysisSimple({
  template,
  onTemplateUpdate,
  onVariablesUpdate,
  onVersionCreate,
  onToast,
  isEditMode = false
}: TemplateAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'variables'>('summary')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [variables, setVariables] = useState<any[]>([])
  const [versionName, setVersionName] = useState('')
  const [showOccurrencesModal, setShowOccurrencesModal] = useState(false)
  const [selectedVariable, setSelectedVariable] = useState<any>(null)
  const [variableEditMode, setVariableEditMode] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load variables from cache on mount or template change
  useEffect(() => {
    if (template?.analysis_cache?.complete?.missingInfo) {
      const loadedVars = template.analysis_cache.complete.missingInfo.map((v: any) => ({
        ...v,
        userInput: v.userInput || ''
      }))
      setVariables(loadedVars)
      onVariablesUpdate?.(loadedVars)
    }
  }, [template?.id, template?.analysis_cache, refreshKey])

  // Simple progress animation
  useEffect(() => {
    if (analyzing && analysisProgress < 90) {
      const timer = setTimeout(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [analyzing, analysisProgress])

  const handleAnalyze = async () => {
    if (!template?.id || analyzing) return

    try {
      setAnalyzing(true)
      setAnalysisProgress(0)
      onToast('Starting template analysis...', 'info')

      const response = await fetch('/api/template/analyze-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          forceRefresh: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const result = await response.json()
      
      // Analysis complete
      setAnalysisProgress(100)
      
      // Wait a moment for the API to save the data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh template data
      const refreshResponse = await fetch(`/api/template/${template.id}`)
      if (refreshResponse.ok) {
        const refreshedTemplate = await refreshResponse.json()
        console.log('✅ Refreshed template:', {
          hasCache: !!refreshedTemplate.analysis_cache,
          variableCount: refreshedTemplate.analysis_cache?.complete?.missingInfo?.length || 0
        })
        onTemplateUpdate(refreshedTemplate)
        // Force refresh of variables
        setRefreshKey(prev => prev + 1)
      }
      
      onToast('Template analysis completed!', 'success')
      
    } catch (error) {
      console.error('Analysis error:', error)
      onToast(error instanceof Error ? error.message : 'Analysis failed', 'error')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const handleVariableChange = (id: string, value: string) => {
    const updated = variables.map(v => 
      v.id === id ? { ...v, userInput: value } : v
    )
    setVariables(updated)
    onVariablesUpdate?.(updated)
  }

  const handleCreateVersion = () => {
    if (!versionName.trim()) {
      onToast('Please enter a version name', 'error')
      return
    }
    
    const filledVariables = variables.map(v => ({
      id: v.id,
      label: v.label,
      value: v.userInput || v.placeholder,
      fieldType: v.fieldType
    }))
    
    onVersionCreate?.(filledVariables, versionName)
    onToast('Creating template version...', 'info')
  }

  const handleViewOccurrences = (variable: any) => {
    setSelectedVariable(variable)
    setShowOccurrencesModal(true)
  }

  const handleOccurrenceClick = (occurrence: any, occurrenceIndex: number) => {
    if (!occurrence) return
    
    // Close the modal immediately for better UX
    setShowOccurrencesModal(false)
    
    // Find the text in the template editor and scroll to it
    setTimeout(() => {
      // Get the template editor content area
      const templateEditor = document.querySelector('[data-template-editor]')
      if (!templateEditor) {
        onToast('Template editor not found', 'error')
        return
      }
      
      // Get the text we're looking for
      // If the template has been normalized, the text might be in {{Variable_Name}} format
      const searchText = occurrence.text || `{{${selectedVariable.label.replace(/\s+/g, '_')}}}`
      if (!searchText) {
        onToast('No text to search for', 'error')
        return
      }
      
      console.log('🔍 Searching for occurrence:', { 
        text: searchText, 
        index: occurrenceIndex,
        position: occurrence.position 
      })
      
      // Get all the text content from the editor to find exact positions
      const editorText = templateEditor.textContent || ''
      console.log('📝 Editor text preview:', editorText.substring(0, 200) + '...')
      
      // Find all occurrences of the search text
      const allMatches: Array<{ index: number }> = []
      let searchIndex = 0
      while (searchIndex < editorText.length) {
        const foundIndex = editorText.indexOf(searchText, searchIndex)
        if (foundIndex === -1) break
        allMatches.push({ index: foundIndex })
        searchIndex = foundIndex + 1
      }
      
      console.log(`Found ${allMatches.length} total matches for "${searchText}"`)
      
      if (occurrenceIndex >= allMatches.length) {
        console.error('Occurrence index out of bounds:', occurrenceIndex, 'total:', allMatches.length)
        onToast('Could not find this specific occurrence', 'error')
        return
      }
      
      const targetMatch = allMatches[occurrenceIndex]
      
      // Now find the text node that contains this position
      const walker = document.createTreeWalker(
        templateEditor,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      let currentPosition = 0
      let targetNode: Node | null = null
      let targetOffset = 0
      
      while (walker.nextNode()) {
        const currentNode = walker.currentNode
        const nodeText = currentNode.textContent || ''
        const nodeLength = nodeText.length
        
        // Check if our target position falls within this text node
        if (targetMatch.index >= currentPosition && 
            targetMatch.index < currentPosition + nodeLength) {
          targetNode = currentNode
          targetOffset = targetMatch.index - currentPosition
          break
        }
        
        currentPosition += nodeLength
      }
      
      if (targetNode && targetNode.parentElement) {
        console.log('✅ Found target node at offset:', targetOffset)
        
        try {
          // Create a range for the found text
          const range = document.createRange()
          range.setStart(targetNode, targetOffset)
          range.setEnd(targetNode, targetOffset + searchText.length)
          
          // Create highlight element
          const highlight = document.createElement('span')
          highlight.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
            border-radius: 3px;
            padding: 0 2px;
            box-shadow: 0 0 0 2px rgba(252, 211, 77, 0.2);
            animation: variableHighlight 2s ease-in-out;
          `
          
          // Add CSS animation if not already added
          const animationId = 'variableHighlightAnimation'
          if (!document.getElementById(animationId)) {
            const style = document.createElement('style')
            style.id = animationId
            style.textContent = `
              @keyframes variableHighlight {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.02); }
              }
            `
            document.head.appendChild(style)
          }
          
          // Wrap the text in highlight
          range.surroundContents(highlight)
          
          // Scroll to the highlighted element
          highlight.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Remove highlight after 4 seconds
          setTimeout(() => {
            const text = highlight.textContent || ''
            const parent = highlight.parentNode
            if (parent) {
              parent.replaceChild(document.createTextNode(text), highlight)
              parent.normalize()
            }
          }, 4000)
          
          onToast('Scrolled to occurrence', 'success')
        } catch (error) {
          console.error('Error highlighting text:', error)
          // Fallback: just scroll to the general area
          if (targetNode.parentElement) {
            targetNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      } else {
        console.error('❌ Could not find occurrence:', { 
          searchText, 
          occurrenceIndex, 
          matchCount 
        })
        onToast('Could not find this occurrence in the template', 'error')
      }
    }, 100)
  }

  const hasAnalysis = !!template?.analysis_cache?.summary

  return (
    <div className={styles.analysisContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Template Analysis</h2>
          <span className={styles.subtitle}>
            {hasAnalysis ? 'Analysis complete' : 'Not analyzed'}
          </span>
        </div>
        
        <div className={styles.actions}>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className={styles.analyzeButton}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Template'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {analyzing && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <span className={styles.progressText}>
            Analyzing template... {analysisProgress}%
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'variables' ? styles.active : ''}`}
          onClick={() => setActiveTab('variables')}
        >
          Variables {variables.length > 0 && `(${variables.length})`}
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'summary' && (
          <div className={styles.summaryTab}>
            {hasAnalysis ? (
              <>
                <div className={styles.summarySection}>
                  <h3>Overview</h3>
                  <p>{template.analysis_cache.summary.overview}</p>
                </div>
                <div className={styles.summarySection}>
                  <h3>Template Type</h3>
                  <p>{template.analysis_cache.summary.contract_type}</p>
                </div>
                <div className={styles.summarySection}>
                  <h3>Key Information</h3>
                  <ul>
                    {Object.entries(template.analysis_cache.summary.key_terms || {}).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key.replace(/_/g, ' ')}: </strong>
                        {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>No analysis available. Click "Analyze Template" to start.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'variables' && (
          <div className={styles.variablesTab}>
            {variables.length > 0 ? (
              <>
                <div className={styles.variablesHeader}>
                  <p>Fill in the values below to create a template version:</p>
                </div>

                <div className={styles.variablesList}>
                  {variables.map((variable) => (
                    <div key={variable.id} className={styles.variableItem}>
                      <div className={styles.variableHeader}>
                        <label className={styles.variableLabel}>
                          {variable.label}
                        </label>
                        {variable.occurrences && variable.occurrences.length > 0 && (
                          <button
                            className={styles.viewOccurrencesBtn}
                            onClick={() => handleViewOccurrences(variable)}
                          >
                            View {variable.occurrences.length} occurrence{variable.occurrences.length > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                      <p className={styles.variableDescription}>
                        {variable.description}
                      </p>
                      <input
                        type={variable.fieldType === 'number' ? 'number' : 'text'}
                        className={styles.variableInput}
                        placeholder={variable.placeholder}
                        value={variable.userInput || ''}
                        onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.versionCreation}>
                  <div className={styles.versionCreationHeader}>
                    <h3 className={styles.versionCreationTitle}>Create Template Version</h3>
                    <p className={styles.versionCreationDescription}>
                      Give this version a name to identify it later
                    </p>
                  </div>
                  <div className={styles.versionCreationForm}>
                    <input
                      type="text"
                      className={styles.versionNameInput}
                      placeholder="e.g., 'Acme Corp Service Agreement' or 'Q1 2024 Template'"
                      value={versionName}
                      onChange={(e) => setVersionName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && versionName.trim()) {
                          handleCreateVersion()
                        }
                      }}
                    />
                    <Button
                      onClick={handleCreateVersion}
                      disabled={!versionName.trim()}
                      className={styles.createVersionButton}
                    >
                      Create Version
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>No variables detected. Analyze the template to identify customizable fields.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Occurrences Modal */}
      {showOccurrencesModal && selectedVariable && (
        <div className={styles.modal} onClick={() => setShowOccurrencesModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Occurrences of "{selectedVariable.label}"</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowOccurrencesModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {selectedVariable.occurrences?.map((occurrence: any, index: number) => (
                <div
                  key={index}
                  className={styles.occurrenceItem}
                  onClick={() => handleOccurrenceClick(occurrence, index)}
                >
                  <span className={styles.occurrenceIndex}>#{index + 1}</span>
                  <span className={styles.occurrenceContext}>
                    ...{occurrence.context}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Type declarations for global functions
declare global {
  interface Window {
    scrollToTemplatePosition?: (position: number) => void
    highlightTemplateText?: (position: number, length: number) => void
    addTemplateVariable?: (text: string, position: number, length: number) => void
  }
}