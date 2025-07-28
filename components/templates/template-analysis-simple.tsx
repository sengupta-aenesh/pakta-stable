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
  }, [template?.id, template?.analysis_cache])

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
      
      // Refresh template data
      const refreshResponse = await fetch(`/api/template/${template.id}`)
      if (refreshResponse.ok) {
        const refreshedTemplate = await refreshResponse.json()
        onTemplateUpdate(refreshedTemplate)
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

  const handleOccurrenceClick = (position: number) => {
    // Scroll to position in editor
    if (window.scrollToTemplatePosition) {
      window.scrollToTemplatePosition(position)
    }
    setShowOccurrencesModal(false)
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
                  {variableEditMode && (
                    <Button
                      onClick={() => setVariableEditMode(false)}
                      variant="secondary"
                      size="sm"
                    >
                      Exit Edit Mode
                    </Button>
                  )}
                  {!variableEditMode && (
                    <Button
                      onClick={() => {
                        setVariableEditMode(true)
                        onToast('Select text in the template to create variables', 'info')
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Create Variables
                    </Button>
                  )}
                </div>

                <div className={styles.variablesList}>
                  {variables.map((variable) => (
                    <div key={variable.id} className={styles.variableItem}>
                      <div className={styles.variableHeader}>
                        <label className={styles.variableLabel}>
                          {variable.label}
                        </label>
                        <button
                          className={styles.occurrencesButton}
                          onClick={() => handleViewOccurrences(variable)}
                        >
                          View {variable.occurrences?.length || 0} occurrences
                        </button>
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
                  <input
                    type="text"
                    className={styles.versionNameInput}
                    placeholder="Enter version name (e.g., 'Acme Corp Agreement')"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateVersion}
                    disabled={!versionName.trim()}
                  >
                    Create Template Version
                  </Button>
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
                  onClick={() => handleOccurrenceClick(occurrence.position)}
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
    addTemplateVariable?: (text: string, position: number, length: number) => void
  }
}