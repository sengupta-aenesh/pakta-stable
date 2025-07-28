'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Template, MissingInfoItem } from '@/lib/supabase-client'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import { notificationHelpers } from '@/components/notifications/notification.utils'
// Removed Button import to match contract analysis styling
import styles from './template-analysis.module.css'

interface TemplateAnalysisProps {
  template: Template
  onTemplateUpdate: (template: Template) => void
  onVariablesUpdate?: (variables: Array<{
    id: string
    label: string
    userInput: string
    fieldType: string
  }>) => void
  onVersionCreate?: (variables: Array<{ id: string; label: string; value: string; fieldType: string }>, versionName: string) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
  isEditMode?: boolean
}

export default function TemplateAnalysis({
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
  const [progressSimulation, setProgressSimulation] = useState<NodeJS.Timeout | null>(null)
  const [currentProgressStep, setCurrentProgressStep] = useState(0)
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null)
  const simulationActiveRef = useRef<boolean>(false)
  const currentStepRef = useRef<number>(0)
  const completionToastShownRef = useRef<boolean>(false)
  const [templateVariables, setTemplateVariables] = useState<MissingInfoItem[]>([])
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  
  // Debug template prop
  console.log('🔍 TemplateAnalysis component:', {
    templateId: template?.id,
    templateTitle: template?.title,
    analysisStatus: template?.analysis_status,
    analysisProgress: template?.analysis_progress,
    hasAnalysisCache: !!template?.analysis_cache,
    hasSummary: !!template?.analysis_cache?.summary,
    hasComplete: !!template?.analysis_cache?.complete,
    templateProp: template,
    isTemplateNull: template === null,
    isTemplateUndefined: template === undefined,
    templateType: typeof template
  })
  const [selectedVariable, setSelectedVariable] = useState<MissingInfoItem | null>(null)
  const [showOccurrencesList, setShowOccurrencesList] = useState(false)
  const [showCustomVariableModal, setShowCustomVariableModal] = useState(false)
  const [customVariableForm, setCustomVariableForm] = useState({
    label: '',
    description: '',
    fieldType: 'text' as 'text' | 'email' | 'number' | 'date'
  })

  // Progressive progress simulation for better UX
  const startProgressSimulation = () => {
    console.log('🚀 Starting progress simulation...')
    simulationActiveRef.current = true
    currentStepRef.current = 0
    
    const progressSteps = [
      { step: 10, message: 'Starting template analysis...', delay: 1500 },
      { step: 25, message: 'Analyzing template structure...', delay: 2000 },
      { step: 40, message: 'Processing template content...', delay: 2000 },
      { step: 55, message: 'Identifying template variables...', delay: 2500 },
      { step: 70, message: 'Extracting template fields...', delay: 2000 },
      { step: 85, message: 'Finalizing analysis...', delay: 2000 },
      { step: 95, message: 'Completing analysis...', delay: 1500 }
    ]
    
    const simulateProgress = () => {
      console.log(`📊 simulateProgress called - step ${currentStepRef.current}, active: ${simulationActiveRef.current}`)
      
      if (currentStepRef.current < progressSteps.length && simulationActiveRef.current) {
        const { step, message, delay } = progressSteps[currentStepRef.current]
        
        console.log(`📊 Progress simulation step ${currentStepRef.current + 1}: ${step}% - ${message}`)
        
        // Update progress immediately
        setAnalysisProgress(step)
        setCurrentProgressStep(step)
        
        currentStepRef.current++
        
        // Schedule next step
        console.log(`⏰ Scheduling next step in ${delay}ms`)
        const nextTimeout = setTimeout(() => {
          if (simulationActiveRef.current) {
            simulateProgress()
          }
        }, delay)
        setProgressSimulation(nextTimeout)
      } else if (!simulationActiveRef.current) {
        console.log('⏹️ Progress simulation stopped - analysis completed')
      } else {
        console.log('📊 Progress simulation completed all steps')
      }
    }
    
    // Start simulation with first progress update immediately
    console.log('📊 Starting progress simulation immediately')
    setAnalysisProgress(progressSteps[0].step)
    setCurrentProgressStep(progressSteps[0].step)
    currentStepRef.current = 1 // Start at step 1 since we already set first step
    
    // Schedule the second step
    const nextTimeout = setTimeout(() => {
      simulateProgress()
    }, progressSteps[0].delay)
    setProgressSimulation(nextTimeout)
  }
  
  // Clear progress simulation
  const clearProgressSimulation = () => {
    console.log('🧹 Clearing progress simulation...')
    simulationActiveRef.current = false
    currentStepRef.current = 0
    if (progressSimulation) {
      clearTimeout(progressSimulation)
      setProgressSimulation(null)
    }
  }

  // Helper function to refresh template data
  const refreshTemplateData = async () => {
    try {
      console.log('🔄 Refreshing template data after analysis completion...')
      const response = await fetch(`/api/template/${template.id}`)
      if (response.ok) {
        const refreshedTemplate = await response.json()
        console.log('✅ Template data refreshed:', {
          id: refreshedTemplate.id,
          status: refreshedTemplate.analysis_status,
          hasVariables: !!refreshedTemplate.analysis_cache?.complete?.missingInfo,
          variableCount: refreshedTemplate.analysis_cache?.complete?.missingInfo?.length || 0
        })
        onTemplateUpdate(refreshedTemplate)
      } else {
        console.error('Failed to refresh template data')
        // Fallback to basic update
        const updatedTemplate = { ...template, analysis_status: 'complete', analysis_progress: 100 }
        onTemplateUpdate(updatedTemplate)
      }
    } catch (error) {
      console.error('Error refreshing template data:', error)
      // Fallback to basic update
      const updatedTemplate = { ...template, analysis_status: 'complete', analysis_progress: 100 }
      onTemplateUpdate(updatedTemplate)
    }
  }

  // Progress checking function for template analysis
  const checkAnalysisProgress = useCallback(async () => {
    if (!template?.id) return
    
    try {
      const response = await fetch(`/api/template/analysis-status?templateId=${template.id}`)
      if (response.ok) {
        const statusData = await response.json()
        
        // Update progress - use backend progress if higher than simulation
        const backendProgress = statusData.progress || 0
        console.log(`📊 Backend status check:`, { 
          status: statusData.status, 
          progress: backendProgress, 
          currentSimulationStep: currentProgressStep 
        })
        
        // Always use the higher of backend progress or current displayed progress
        if (backendProgress > 0 && backendProgress < 100) {
          console.log(`📈 Backend progress: ${backendProgress}%`)
          // Only update if backend is ahead of current displayed progress
          if (backendProgress > analysisProgress) {
            setAnalysisProgress(backendProgress)
          }
          // Don't clear simulation - let it run for smooth UX
        }
        
        // Check if analysis is still running
        const isAnalysisRunning = statusData.status === 'in_progress' || 
                                 statusData.status === 'pending' || 
                                 statusData.status === 'summary_complete'
        
        if (isAnalysisRunning && template?.id === statusData.templateId) {
          // Analysis is still running, don't do anything here
          // The polling interval will handle the next check
          console.log('📊 Analysis still in progress, continuing to poll...')
        } else if (statusData.status === 'complete') {
          console.log('🎉 Template analysis completed!', { 
            toastShown: completionToastShownRef.current, 
            analyzing: analyzing 
          })
          
          // Only handle completion if we're actually analyzing
          // This prevents double-completion from stale status checks
          if (analyzing && statusData.templateId === template?.id) {
            // Complete the analysis immediately
            clearProgressSimulation()
            setAnalysisProgress(100)
            setAnalyzing(false)
            setAnalysisStartTime(null)
          
          // Refresh template data
          try {
            console.log('🔄 Refreshing template data after analysis completion...')
            const response = await fetch(`/api/template/${template.id}`)
            if (response.ok) {
              const refreshedTemplate = await response.json()
              console.log('✅ Template data refreshed:', {
                id: refreshedTemplate.id,
                status: refreshedTemplate.analysis_status,
                      hasVariables: !!refreshedTemplate.analysis_cache?.complete?.missingInfo,
                variableCount: refreshedTemplate.analysis_cache?.complete?.missingInfo?.length || 0
              })
              console.log('📤 Calling onTemplateUpdate with refreshed template')
              onTemplateUpdate(refreshedTemplate)
              
              // Force reload variables after analysis completes
              setTimeout(() => {
                loadTemplateVariables()
              }, 100)
            } else {
              console.error('Failed to refresh template data')
              // Fallback to basic update
              const updatedTemplate = { ...template, analysis_status: 'complete', analysis_progress: 100 }
              onTemplateUpdate(updatedTemplate)
            }
          } catch (error) {
            console.error('Error refreshing template data:', error)
            // Fallback to basic update
            const updatedTemplate = { ...template, analysis_status: 'complete', analysis_progress: 100 }
            onTemplateUpdate(updatedTemplate)
          }
          
            // Show completion notification only once
            if (!completionToastShownRef.current) {
              completionToastShownRef.current = true // Mark as shown
              
              // Simple completion notification for templates
              const notification = notificationHelpers.analysisCompleted(
                'template',
                template.id,
                0,  // No risks for templates
                undefined
              )
              
              onToast('Template analysis completed successfully!', 'success')
            }
          }
          return // Stop execution here to prevent further polling
        } else if (statusData.status === 'failed') {
          clearProgressSimulation() // Clear simulation on failure
          setAnalyzing(false)
          setAnalysisProgress(0)
          setAnalysisStartTime(null)
          onToast('Template analysis failed. Please try again.', 'error')
        }
        // Note: Polling is already handled in the isAnalysisRunning block above
      }
    } catch (error) {
      console.error('Failed to check analysis progress:', error)
      // Retry on error if still analyzing
      if (analyzing) {
        setTimeout(() => checkAnalysisProgress(), 2000)
      }
    }
  }, [template?.id, analyzing, onToast, onTemplateUpdate, analysisProgress])

  // Handle analysis triggering
  const handleAnalyzeTemplate = async () => {
    if (!template?.id) return

    try {
      setAnalyzing(true)
      setAnalysisProgress(0)
      setCurrentProgressStep(0)
      currentStepRef.current = 0
      completionToastShownRef.current = false // Reset the toast flag
      setAnalysisStartTime(Date.now())
      onToast('Starting template analysis...', 'info')

      // Start progress simulation immediately for better UX
      console.log('🎬 Calling startProgressSimulation from handleAnalyzeTemplate')
      startProgressSimulation()
      console.log('✅ Progress simulation started')

      const response = await fetch('/api/template/auto-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          forceRefresh: true
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Template analysis API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || `Failed to start template analysis (${response.status})`)
      }

      const result = await response.json()
      
      // Check if the result has the expected structure
      console.log('Analysis API response:', result)
      
      if (result.status === 'complete') {
        // Analysis completed immediately (synchronous processing)
        console.log('🎉 Analysis completed immediately!', result)
        
        // Clear any progress simulation
        clearProgressSimulation()
        setAnalysisProgress(100)
        setAnalyzing(false)
        setAnalysisStartTime(null)
        
        // Refresh template data immediately
        try {
          console.log('🔄 Refreshing template data after immediate completion...')
          const refreshResponse = await fetch(`/api/template/${template.id}`)
          if (refreshResponse.ok) {
            const refreshedTemplate = await refreshResponse.json()
            console.log('✅ Template data refreshed:', {
              id: refreshedTemplate.id,
              status: refreshedTemplate.analysis_status,
              hasVariables: !!refreshedTemplate.analysis_cache?.complete?.missingInfo,
              variableCount: refreshedTemplate.analysis_cache?.complete?.missingInfo?.length || 0
            })
            onTemplateUpdate(refreshedTemplate)
            
            // Force reload variables after analysis completes
            setTimeout(() => {
              loadTemplateVariables()
            }, 100)
          }
        } catch (error) {
          console.error('Error refreshing template after immediate completion:', error)
        }
        
        onToast('Template analysis completed successfully!', 'success')
        
      } else if (result.status === 'in_progress') {
        // Analysis will complete asynchronously - let polling handle it
        console.log('✅ Analysis started successfully', {
          status: result.status,
          message: result.message
        })
        // The polling will be handled by the useEffect that watches 'analyzing' state
      } else if (result.status === 'failed') {
        throw new Error(result.error || 'Analysis failed')
      } else {
        throw new Error(result.message || result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Template analysis error:', error)
      clearProgressSimulation() // Clear simulation on error
      
      // Provide more specific error messages
      let errorMessage = 'Template analysis failed. '
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Session expired. Please refresh the page and try again.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Template data is invalid. Please check the template content.'
        } else if (error.message.includes('404')) {
          errorMessage = 'Template not found. Please refresh the page.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage += error.message
        }
      }
      
      onToast(errorMessage, 'error')
      setAnalyzing(false)
      setAnalysisProgress(0)
      setAnalysisStartTime(null)
    }
  }

  // Get analysis status info
  const getAnalysisStatus = () => {
    const status = template.analysis_status
    const progress = template.analysis_progress || 0

    if (!status || status === 'pending') return { text: 'Not analyzed', color: '#6B7280' }
    if (status === 'in_progress') return { text: `Analyzing... ${progress}%`, color: '#F59E0B' }
    if (status === 'complete') return { text: 'Analysis complete', color: '#10B981' }
    if (status === 'failed') return { text: 'Analysis failed', color: '#EF4444' }
    return { text: status, color: '#6B7280' }
  }

  const statusInfo = getAnalysisStatus()
  const hasAnalysis = template.analysis_cache?.summary
  
  console.log('📊 Analysis status check:', {
    statusInfo,
    hasAnalysis,
    analysisCache: template.analysis_cache,
    activeTab,
    analyzing
  })




  // Handle variable input changes
  const handleVariableChange = (id: string, value: string) => {
    setTemplateVariables(prev => {
      const updated = prev.map(variable => 
        variable.id === id ? { ...variable, userInput: value } : variable
      )
      
      // Notify parent component of variable changes
      if (onVariablesUpdate) {
        const formattedVariables = updated.map(v => ({
          id: v.id,
          label: v.label,
          userInput: v.userInput,
          fieldType: v.fieldType
        }))
        onVariablesUpdate(formattedVariables)
      }
      
      return updated
    })
  }

  // Handle viewing variable occurrences
  const handleViewOccurrences = (variable: MissingInfoItem) => {
    setSelectedVariable(variable)
    setShowOccurrencesList(true)
  }

  // Handle scrolling to specific occurrence
  const handleScrollToOccurrence = useCallback((variable: MissingInfoItem, occurrenceIndex: number) => {
    const occurrence = variable.occurrences[occurrenceIndex]
    if (!occurrence) return

    // Close the overlay immediately for better UX
    setShowOccurrencesList(false)
    setSelectedVariable(null)
    
    // Find the text in the template editor and scroll to it
    setTimeout(() => {
      // Get the template editor content area
      const templateEditor = document.querySelector('[data-template-editor]')
      if (!templateEditor) {
        onToast('Template editor not found', 'error')
        return
      }
      
      // Create a temporary highlight element for this occurrence
      const walker = document.createTreeWalker(
        templateEditor,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      let currentNode: Node | null
      let currentPosition = 0
      let targetNode: Node | null = null
      let targetOffset = 0
      
      // Walk through text nodes to find the occurrence position
      while (currentNode = walker.nextNode()) {
        const nodeText = currentNode.textContent || ''
        const nodeLength = nodeText.length
        
        // Check if our target position falls within this text node
        if (occurrence.position && 
            occurrence.position.start >= currentPosition && 
            occurrence.position.start < currentPosition + nodeLength) {
          targetNode = currentNode
          targetOffset = occurrence.position.start - currentPosition
          break
        }
        
        currentPosition += nodeLength
      }
      
      if (targetNode) {
        // Create a range to highlight the text
        const range = document.createRange()
        const endOffset = Math.min(
          targetOffset + (occurrence.text?.length || 0),
          (targetNode.textContent || '').length
        )
        
        try {
          range.setStart(targetNode, targetOffset)
          range.setEnd(targetNode, endOffset)
          
          // Create a temporary highlight span
          const highlightSpan = document.createElement('span')
          highlightSpan.style.cssText = `
            background: linear-gradient(135deg, #fef3c7, #fcd34d);
            color: #92400e;
            padding: 2px 4px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
            font-weight: 600;
            animation: variableHighlight 3s ease-in-out;
          `
          highlightSpan.setAttribute('data-temp-highlight', 'true')
          
          // Add CSS animation if not already present
          if (!document.querySelector('#variableHighlightStyle')) {
            const style = document.createElement('style')
            style.id = 'variableHighlightStyle'
            style.textContent = `
              @keyframes variableHighlight {
                0%, 100% { transform: scale(1); background: linear-gradient(135deg, #fef3c7, #fcd34d); }
                25% { transform: scale(1.05); background: linear-gradient(135deg, #fde68a, #f59e0b); }
                50% { transform: scale(1.02); background: linear-gradient(135deg, #fbbf24, #d97706); }
                75% { transform: scale(1.05); background: linear-gradient(135deg, #fde68a, #f59e0b); }
              }
            `
            document.head.appendChild(style)
          }
          
          // Wrap the text in the highlight span
          range.surroundContents(highlightSpan)
          
          // Scroll to the highlighted element
          highlightSpan.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
          
          // Remove the highlight after 4 seconds
          setTimeout(() => {
            if (highlightSpan.parentNode) {
              const parent = highlightSpan.parentNode
              while (highlightSpan.firstChild) {
                parent.insertBefore(highlightSpan.firstChild, highlightSpan)
              }
              parent.removeChild(highlightSpan)
            }
          }, 4000)
          
          onToast(`Found occurrence ${occurrenceIndex + 1} of "${variable.label}"`, 'success')
          
        } catch (error) {
          console.warn('Could not highlight occurrence:', error)
          // Fallback: just scroll to the general area
          templateEditor.scrollIntoView({ behavior: 'smooth', block: 'start' })
          onToast(`Scrolled to template area for "${variable.label}"`, 'info')
        }
      } else {
        onToast(`Could not locate occurrence ${occurrenceIndex + 1} of "${variable.label}"`, 'error')
      }
    }, 300) // Small delay to allow modal to close
    
  }, [onToast])

  // Handle adding new variable from selected text
  const handleAddVariable = (selectedText: string, position: { start: number; end: number }) => {
    if (!selectedText.trim()) {
      onToast('Please select some text to create a variable', 'error')
      return
    }

    // Create a new variable
    const newVariable: MissingInfoItem = {
      id: `var-${Date.now()}`,
      label: `Variable: ${selectedText.substring(0, 20)}${selectedText.length > 20 ? '...' : ''}`,
      description: `Custom variable for "${selectedText}"`,
      placeholder: `Enter value for ${selectedText}`,
      fieldType: 'text',
      userInput: '',
      occurrences: [{
        text: selectedText,
        position: position
      }]
    }

    setTemplateVariables(prev => [...prev, newVariable])
    onToast(`Variable "${newVariable.label}" added successfully`, 'success')
  }


  // Handle custom variable creation
  const handleCreateCustomVariable = () => {
    if (!customVariableForm.label.trim()) {
      onToast('Variable label is required', 'error')
      return
    }

    const newVariable: MissingInfoItem = {
      id: `custom-var-${Date.now()}`,
      label: customVariableForm.label.trim(),
      description: customVariableForm.description.trim() || `Custom ${customVariableForm.fieldType} variable`,
      fieldType: customVariableForm.fieldType,
      userInput: '',
      occurrences: [{
        text: `[${customVariableForm.label.trim()}]`,
        context: 'Custom variable - manually created',
        position: { start: 0, end: customVariableForm.label.length + 2 }
      }]
    }

    setTemplateVariables(prev => {
      const updated = [...prev, newVariable]
      
      // Notify parent component of variable changes
      if (onVariablesUpdate) {
        const formattedVariables = updated.map(v => ({
          id: v.id,
          label: v.label,
          userInput: v.userInput,
          fieldType: v.fieldType
        }))
        onVariablesUpdate(formattedVariables)
      }
      
      return updated
    })
    
    // Reset form and close modal
    setCustomVariableForm({
      label: '',
      description: '',
      fieldType: 'text'
    })
    setShowCustomVariableModal(false)
    
    onToast(`Custom variable "${newVariable.label}" created successfully`, 'success')
  }

  // Handle creating template version - save to backend and switch to version mode
  const handleCreateVersion = async () => {
    if (!template?.id || !onVersionCreate) return
    
    // Prepare variables with values
    const variablesWithValues = templateVariables
      .filter(variable => variable.userInput.trim())
      .map(variable => ({
        id: variable.id,
        label: variable.label,
        value: variable.userInput,
        fieldType: variable.fieldType
      }))
    
    if (variablesWithValues.length === 0) {
      onToast('Please fill in at least one variable value to create a version.', 'info')
      return
    }
    
    const versionName = `Version ${new Date().toLocaleString()}`
    
    console.log('🎯 Creating template version with variables:', variablesWithValues)
    
    try {
      // Call the backend API to create the version
      const response = await fetch('/api/template/create-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          variables: variablesWithValues,
          createdAt: new Date().toISOString(),
          vendorName: 'Default' // You can make this configurable if needed
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create version')
      }

      const result = await response.json()
      console.log('✅ Template version created in backend:', result)
      
      // Trigger version mode in parent component to show the filled template
      onVersionCreate(variablesWithValues, versionName)
      
      onToast(`Template version "${versionName}" created and saved! View the filled template above.`, 'success')
    } catch (error) {
      console.error('Error creating template version:', error)
      onToast('Failed to create template version. Please try again.', 'error')
    }
  }

  // Reset completion toast flag when template changes
  useEffect(() => {
    completionToastShownRef.current = false
  }, [template?.id])

  // Load template variables from analysis cache AND user-created variables
  const loadTemplateVariables = useCallback(() => {
    console.log('🔍 Template variables loading check:', {
      hasTemplate: !!template,
      hasAnalysisCache: !!template?.analysis_cache,
      hasComplete: !!template?.analysis_cache?.complete,
      hasMissingInfo: !!template?.analysis_cache?.complete?.missingInfo,
      hasUserCreatedVariables: !!template?.user_created_variables,
      userCreatedCount: template?.user_created_variables?.length || 0,
      missingInfoCount: template?.analysis_cache?.complete?.missingInfo?.length || 0,
      templateId: template?.id,
      analysisStatus: template?.analysis_status,
      cacheKeys: template?.analysis_cache ? Object.keys(template.analysis_cache) : []
    })

    const allVariables: MissingInfoItem[] = []
    const seenLabels = new Set<string>()

    // First, add user-created variables
    if (template?.user_created_variables && template.user_created_variables.length > 0) {
      template.user_created_variables.forEach(userVar => {
        const normalizedLabel = userVar.label.toLowerCase()
        if (!seenLabels.has(normalizedLabel)) {
          seenLabels.add(normalizedLabel)
          
          // Count occurrences in template content
          const variablePattern = `{{${userVar.label.replace(/\s+/g, '_')}}}`
          const regex = new RegExp(variablePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          const matches = (template.content || '').match(regex) || []
          
          allVariables.push({
            id: userVar.id,
            label: userVar.label,
            description: userVar.description || `User-created ${userVar.fieldType} variable`,
            fieldType: userVar.fieldType,
            userInput: '',
            occurrences: matches.map((match, index) => ({
              text: match,
              context: `Occurrence ${index + 1}`,
              position: { start: 0, end: match.length }
            }))
          })
        }
      })
    }

    // Then add AI-detected variables (if not already added by user)
    if (template?.analysis_status === 'complete' && template?.analysis_cache?.complete?.missingInfo) {
      const aiVariables = template.analysis_cache.complete.missingInfo
      
      aiVariables.forEach(aiVar => {
        const normalizedLabel = aiVar.label.toLowerCase()
        if (!seenLabels.has(normalizedLabel)) {
          seenLabels.add(normalizedLabel)
          allVariables.push(aiVar)
        }
      })
    }
    
    console.log('📥 Loading all template variables:', {
      totalCount: allVariables.length,
      userCreatedCount: template?.user_created_variables?.length || 0,
      aiDetectedCount: template?.analysis_cache?.complete?.missingInfo?.length || 0,
      allVariables: allVariables.map(v => ({ id: v.id, label: v.label, fieldType: v.fieldType }))
    })
    
    // CRITICAL: Preserve existing user input when updating variables
    setTemplateVariables(prevVariables => {
      const updatedVariables = allVariables.map(newVar => {
        // Find existing variable with same ID or label
        const existingVar = prevVariables.find(prev => 
          prev.id === newVar.id || prev.label.toLowerCase() === newVar.label.toLowerCase()
        )
        
        // Preserve user input if it exists
        return {
          ...newVar,
          userInput: existingVar?.userInput || newVar.userInput || ''
        }
      })
      
      console.log('🔄 Template variables updated with user input preserved:', {
        previousCount: prevVariables.length,
        newCount: updatedVariables.length,
        preservedInputs: updatedVariables.filter(v => v.userInput).length
      })
      
      return updatedVariables
    })
    
    // Notify parent component of variable load with preserved input
    if (onVariablesUpdate && allVariables.length > 0) {
      setTimeout(() => {
        const formattedVariables = allVariables.map(v => ({
          id: v.id,
          label: v.label,
          userInput: '',
          fieldType: v.fieldType
        }))
        console.log('📤 Notifying parent of variable updates:', formattedVariables)
        onVariablesUpdate(formattedVariables)
      }, 100) // Small delay to ensure state update
    }
  }, [template?.analysis_status, template?.analysis_cache?.complete?.missingInfo, template?.user_created_variables, template?.content, onVariablesUpdate])

  // Load variables when template changes
  useEffect(() => {
    loadTemplateVariables()
  }, [loadTemplateVariables])

  // Poll for analysis progress
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    let timeoutFallback: NodeJS.Timeout | null = null
    let initialDelay: NodeJS.Timeout | null = null
    
    if (analyzing) {
      console.log('📊 Setting up analysis progress polling...')
      // Check immediately for synchronous completion
      checkAnalysisProgress()
      
      // Then poll every 1.5 seconds
      pollInterval = setInterval(() => {
        console.log('⏰ Polling for analysis progress...')
        checkAnalysisProgress()
      }, 1500) // Poll every 1.5 seconds
      
      // Set a fallback timeout to ensure analysis completes within 2 minutes
      timeoutFallback = setTimeout(() => {
        console.log('⚠️ Analysis timeout reached, forcing completion')
        clearProgressSimulation()
        setAnalysisProgress(100)
        setAnalyzing(false)
        if (!completionToastShownRef.current) {
          completionToastShownRef.current = true
          onToast('Template analysis completed (timeout)', 'info')
        }
      }, 120000) // 2 minutes timeout
    }
    
    return () => {
      if (initialDelay) {
        clearTimeout(initialDelay)
      }
      if (pollInterval) {
        console.log('🧹 Clearing analysis polling interval')
        clearInterval(pollInterval)
      }
      if (timeoutFallback) {
        clearTimeout(timeoutFallback)
      }
    }
  }, [analyzing, checkAnalysisProgress])

  // Cleanup progress simulation on unmount and expose refresh function
  useEffect(() => {
    // Expose function to refresh variables from outside (e.g., when created in editor)
    window.refreshTemplateVariables = () => {
      console.log('🔄 Refreshing template variables from external trigger')
      // Trigger the loadTemplateVariables effect by updating the template
      if (template) {
        // Force re-load of variables
        loadTemplateVariables()
      }
    }

    return () => {
      // Clean up on unmount
      clearProgressSimulation()
      // Clean up global function
      delete window.refreshTemplateVariables
    }
  }, [template, loadTemplateVariables])


  // Early return if no template is provided
  if (!template) {
    console.error('❌ TemplateAnalysis: No template provided')
    return (
      <div className={styles.analysisContainer}>
        <div className={styles.emptyState}>
          <p>No template selected. Please select a template from the sidebar.</p>
        </div>
      </div>
    )
  }

  // Validate template has required properties
  if (!template.id || !template.content) {
    console.error('❌ TemplateAnalysis: Template missing required properties', {
      hasId: !!template.id,
      hasContent: !!template.content,
      contentLength: template.content?.length || 0
    })
    return (
      <div className={styles.analysisContainer}>
        <div className={styles.emptyState}>
          <p>Template is missing required data. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.analysisContainer} data-testid="template-analysis-container">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Template Analysis</h2>
          <div className={styles.status} style={{ color: statusInfo.color }}>
            {statusInfo.text}
          </div>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button"
            className={`${styles.refreshButton} ${styles.analyzeButton}`}
            onClick={handleAnalyzeTemplate}
            disabled={analyzing || isEditMode}
            title={isEditMode ? 'Exit edit mode to analyze template' : undefined}
          >
            {analyzing ? 'Analyzing...' : isEditMode ? 'Exit Edit Mode to Analyze' : 'Analyze Template'}
          </button>
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
          <div className={styles.progressText}>
            {analysisProgress}% complete
            {analyzing && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                {analysisProgress <= 10 ? 'Starting template analysis...' :
                 analysisProgress <= 25 ? 'Analyzing template structure...' :
                 analysisProgress <= 40 ? 'Processing template content...' :
                 analysisProgress <= 55 ? 'Identifying template variables...' :
                 analysisProgress <= 70 ? 'Extracting template fields...' :
                 analysisProgress <= 85 ? 'Finalizing analysis...' :
                 analysisProgress <= 95 ? 'Completing analysis...' :
                 analysisProgress < 100 ? 'Almost done...' : 'Complete!'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={styles.tabNav}>
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
          Variables
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'summary' && (
          <div className={styles.summaryTab}>
            {console.log('📦 Summary Tab Render:', { hasAnalysis, analysisCache: template.analysis_cache, summary: template.analysis_cache?.summary })}
            {hasAnalysis ? (
              <div className={styles.summaryContent}>
                <h3>Template Summary</h3>
                {template.analysis_cache?.summary && (
                  <div className={styles.summarySection}>
                    <h4>Overview</h4>
                    <p>{template.analysis_cache.summary.overview}</p>
                    
                    {template.analysis_cache.summary.contract_type && (
                      <>
                        <h4>Template Type</h4>
                        <p>{template.analysis_cache.summary.contract_type}</p>
                      </>
                    )}

                    {template.analysis_cache.summary.key_terms && (
                      <>
                        <h4>Key Terms</h4>
                        <ul>
                          {Object.entries(template.analysis_cache.summary.key_terms).map(([key, value]) => (
                            <li key={key}><strong>{key}:</strong> {value}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
                
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No analysis available. Click "Analyze Template" to begin.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'variables' && (
          <div className={styles.variablesTab}>
            <div className={styles.variablesHeader}>
              <h3>Template Variables</h3>
              <div className={styles.variablesActions}>
                {templateVariables.length > 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{templateVariables.length} variable{templateVariables.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            {analyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px', color: '#6b7280' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div className={styles.processingSteps}>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>1</span>
                      <span>Identifying template variables...</span>
                    </div>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>2</span>
                      <span>Mapping variable occurrences...</span>
                    </div>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>3</span>
                      <span>Creating variable definitions...</span>
                    </div>
                  </div>
                </div>
                <span>Processing template variables...</span>
              </div>
            ) : templateVariables.length > 0 ? (
              <>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Define values for template variables below. You can create versions of the template with different variable values.
                </p>
                
                {templateVariables.map((variable, index) => (
                  <div key={variable.id} className={styles.variableItem}>
                    <div className={styles.variableHeader}>
                      <label className={styles.variableLabel}>
                        {variable.label}
                        {/* Check if this is a user-created variable */}
                        {template?.user_created_variables?.some(v => v.id === variable.id) && (
                          <span className={styles.userCreatedBadge}>User Created</span>
                        )}
                      </label>
                      <span className={styles.occurrenceCount}>
                        {variable.occurrences.length} occurrence{variable.occurrences.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        className={styles.viewOccurrencesButton}
                        onClick={() => handleViewOccurrences(variable)}
                        title="View all occurrences of this variable in the template"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Occurrences
                      </button>
                    </div>
                    <p className={styles.variableDescription}>{variable.description}</p>
                    {variable.context && (
                      <div className={styles.contextInfo}>
                        <span className={styles.contextLabel}>Context:</span>
                        <code className={styles.contextText}>{variable.context}</code>
                      </div>
                    )}
                    <input
                      type={variable.fieldType === 'date' ? 'date' : variable.fieldType === 'number' ? 'number' : variable.fieldType === 'email' ? 'email' : 'text'}
                      className={styles.variableInput}
                      placeholder={variable.placeholder}
                      value={variable.userInput}
                      onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                    />
                    <div className={styles.previewContainer}>
                      <div className={styles.previewNote}>
                        📍 Standard format: <code>{'{{'}{variable.label.replace(/\s+/g, '_')}{'}}'}</code>
                      </div>
                      <div className={styles.previewNote}>
                        🔍 Found in: {variable.occurrences.map(occ => `"${occ.text}"`).join(', ')}
                      </div>
                      {variable.userInput && (
                        <div className={styles.previewResult}>
                          <span className={styles.previewLabel}>Preview replacement:</span>
                          <code className={styles.previewText}>
                            "{'{{'}{variable.label.replace(/\s+/g, '_')}{'}}'}" → "{variable.userInput}"
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                  <button 
                    className={styles.createVersionButton}
                    onClick={handleCreateVersion}
                    disabled={!templateVariables.some(variable => variable.userInput.trim())}
                  >
                    Create Template Version
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                <p>No template variables detected. Run analysis to identify template variables automatically.</p>
              </div>
            )}
          </div>
        )}


      </div>

      {/* Variable Occurrences Overlay - Enhanced UX */}
      {showOccurrencesList && selectedVariable && (
        <div className={styles.modal} onClick={() => setShowOccurrencesList(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Variable Occurrences: {selectedVariable.label}</h3>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  Click any occurrence to scroll to it in the template
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setShowOccurrencesList(false)}
                title="Close overlay"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="12 6v6l4 2"></path>
                </svg>
                <div style={{ fontSize: '13px', color: '#075985' }}>
                  Found <strong>{selectedVariable.occurrences.length}</strong> occurrence{selectedVariable.occurrences.length !== 1 ? 's' : ''} of this variable. 
                  The overlay will close automatically when you click to scroll.
                </div>
              </div>
              
              <div className={styles.occurrencesList}>
                {selectedVariable.occurrences.map((occurrence, index) => (
                  <div
                    key={index}
                    className={styles.occurrenceItem}
                    onClick={() => handleScrollToOccurrence(selectedVariable, index)}
                    title={`Click to scroll to occurrence ${index + 1}`}
                  >
                    <div className={styles.occurrenceHeader}>
                      <span className={styles.occurrenceNumber}>#{index + 1}</span>
                      <span className={styles.occurrenceText}>"{occurrence.text}"</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {occurrence.position && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#6b7280', 
                            background: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}>
                            pos: {occurrence.position.start}-{occurrence.position.end}
                          </span>
                        )}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={styles.scrollToIcon}
                        >
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  💡 Tip: The overlay closes automatically when you scroll to an occurrence
                </div>
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setShowOccurrencesList(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Variable Creation Modal */}
      {showCustomVariableModal && (
        <div className={styles.modal} onClick={() => setShowCustomVariableModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create Custom Variable</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowCustomVariableModal(false)}
                title="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Create a custom variable that can be used throughout your template. You can manually define variables that weren't automatically detected by the AI.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Variable Label *
                  </label>
                  <input
                    type="text"
                    value={customVariableForm.label}
                    onChange={(e) => setCustomVariableForm(prev => ({ ...prev, label: e.target.value }))}
                    className={styles.variableInput}
                    placeholder="e.g., Company Name, Date, Amount"
                    style={{ marginBottom: '0' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={customVariableForm.description}
                    onChange={(e) => setCustomVariableForm(prev => ({ ...prev, description: e.target.value }))}
                    className={styles.variableInput}
                    placeholder="Brief description of this variable"
                    style={{ marginBottom: '0' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Variable Type
                  </label>
                  <select
                    value={customVariableForm.fieldType}
                    onChange={(e) => setCustomVariableForm(prev => ({ 
                      ...prev, 
                      fieldType: e.target.value as 'text' | 'email' | 'number' | 'date' 
                    }))}
                    className={styles.variableInput}
                    style={{ marginBottom: '0' }}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center',
                gap: '12px',
                width: '100%'
              }}>
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setShowCustomVariableModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.createVersionButton}
                  onClick={handleCreateCustomVariable}
                  disabled={!customVariableForm.label.trim()}
                  style={{ 
                    maxWidth: 'none',
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                >
                  Create Variable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}