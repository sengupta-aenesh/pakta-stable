'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Template, MissingInfoItem } from '@/lib/supabase-client'
// Removed Button import to match contract analysis styling
import styles from './template-analysis.module.css'

interface TemplateAnalysisProps {
  template: Template
  risks: any[]
  onRisksUpdate: (risks: any[]) => void
  onTemplateUpdate: (template: Template) => void
  onVariablesUpdate?: (variables: Array<{
    id: string
    label: string
    userInput: string
    fieldType: string
  }>) => void
  onVersionCreate?: (variables: Array<{ id: string; label: string; value: string; fieldType: string }>, versionName: string) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function TemplateAnalysis({
  template,
  risks,
  onRisksUpdate,
  onTemplateUpdate,
  onVariablesUpdate,
  onVersionCreate,
  onToast
}: TemplateAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'variables' | 'risks'>('summary')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [progressSimulation, setProgressSimulation] = useState<NodeJS.Timeout | null>(null)
  const [currentProgressStep, setCurrentProgressStep] = useState(0)
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null)
  const simulationActiveRef = useRef<boolean>(false)
  const [templateVariables, setTemplateVariables] = useState<MissingInfoItem[]>([])
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [selectedVariable, setSelectedVariable] = useState<MissingInfoItem | null>(null)
  const [showOccurrencesList, setShowOccurrencesList] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
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
    
    const progressSteps = [
      { step: 5, message: 'Analyzing template structure...', delay: 12000 },
      { step: 15, message: 'Identifying template variables...', delay: 14000 },
      { step: 30, message: 'Processing template content...', delay: 13000 },
      { step: 45, message: 'Detecting potential risks...', delay: 15000 },
      { step: 65, message: 'Analyzing template patterns...', delay: 11000 },
      { step: 80, message: 'Finalizing analysis...', delay: 13000 },
      { step: 90, message: 'Completing analysis...', delay: 10000 }
    ]
    
    let currentStep = 0
    
    const simulateProgress = () => {
      console.log(`📊 simulateProgress called - step ${currentStep}, active: ${simulationActiveRef.current}`)
      
      if (currentStep < progressSteps.length && simulationActiveRef.current) {
        const { step, message, delay } = progressSteps[currentStep]
        
        console.log(`📊 Progress simulation step ${currentStep + 1}: ${step}% - ${message}`)
        
        // Update progress
        setAnalysisProgress(prevProgress => {
          const newProgress = Math.max(prevProgress, step)
          console.log(`📈 Setting progress: ${prevProgress} → ${newProgress}`)
          return newProgress
        })
        
        setCurrentProgressStep(step)
        
        currentStep++
        
        // Schedule next step
        console.log(`⏰ Scheduling next step in ${delay}ms`)
        const nextTimeout = setTimeout(simulateProgress, delay)
        setProgressSimulation(nextTimeout)
      } else if (!simulationActiveRef.current) {
        console.log('⏹️ Progress simulation stopped - analysis completed')
      } else {
        console.log('📊 Progress simulation completed all steps')
      }
    }
    
    // Start simulation immediately for first step
    console.log('⏰ Starting first step in 300ms')
    const initialTimeout = setTimeout(() => {
      console.log('📊 Progress simulation first step executing...')
      simulateProgress()
    }, 300)
    setProgressSimulation(initialTimeout)
  }
  
  // Clear progress simulation
  const clearProgressSimulation = () => {
    console.log('🧹 Clearing progress simulation...')
    simulationActiveRef.current = false
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
          hasRisks: !!refreshedTemplate.analysis_cache?.risks,
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
  const checkAnalysisProgress = async () => {
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
        
        if (backendProgress > 0 && backendProgress < 100) {
          console.log(`📈 Backend progress: ${backendProgress}%`)
          setAnalysisProgress(backendProgress)
          // Only clear simulation if backend is significantly ahead
          if (backendProgress > currentProgressStep + 20) {
            clearProgressSimulation()
          }
        }
        
        // Check if analysis is still running
        const isAnalysisRunning = statusData.status === 'in_progress' || 
                                 statusData.status === 'pending' || 
                                 statusData.status === 'summary_complete' || 
                                 statusData.status === 'risks_complete'
        
        if (isAnalysisRunning && template?.id === statusData.templateId) {
          // Continue checking progress more frequently
          setTimeout(() => {
            if (template?.id === statusData.templateId) {
              checkAnalysisProgress()
            }
          }, 1500) // Reduced from 2000ms for more responsive updates
        } else if (statusData.status === 'complete') {
          console.log('🎉 Template analysis completed!')
          
          // Check if minimum animation time has passed (90 seconds total for realistic experience)
          const minAnimationDuration = 90000
          const elapsedTime = analysisStartTime ? Date.now() - analysisStartTime : minAnimationDuration
          
          if (elapsedTime < minAnimationDuration) {
            // Wait for minimum animation time to complete
            const remainingTime = minAnimationDuration - elapsedTime
            console.log(`⏰ Waiting ${remainingTime}ms more for animation to complete`)
            setTimeout(async () => {
              clearProgressSimulation()
              setAnalysisProgress(100)
              setAnalyzing(false)
              setAnalysisStartTime(null)
              
              // Refresh template data
              await refreshTemplateData()
              
              // Show completion notification
              const duplicatesFiltered = statusData.riskData?.duplicatesFiltered || 0
              const smartFilteringApplied = statusData.riskData?.smartFilteringApplied || false
              if (smartFilteringApplied && duplicatesFiltered > 0) {
                onToast(`Template analysis completed! 🎯 Smart filtering removed ${duplicatesFiltered} duplicate${duplicatesFiltered !== 1 ? 's' : ''} already resolved.`, 'success')
              } else {
                onToast('Template analysis completed successfully!', 'success')
              }
            }, remainingTime)
            return // Don't process completion immediately
          }
          
          clearProgressSimulation() // Clear any ongoing simulation
          setAnalysisProgress(100)
          setAnalyzing(false)
          setAnalysisStartTime(null)
          
          // Refresh template data
          await refreshTemplateData()
          
          // Check if smart filtering was applied and show appropriate message
          const riskData = statusData.riskData || template.analysis_cache?.risks
          const duplicatesFiltered = riskData?.duplicatesFiltered || 0
          const smartFilteringApplied = riskData?.smartFilteringApplied || false
          
          if (smartFilteringApplied && duplicatesFiltered > 0) {
            onToast(`Template analysis completed! 🎯 Smart filtering removed ${duplicatesFiltered} duplicate${duplicatesFiltered !== 1 ? 's' : ''} already resolved.`, 'success')
          } else {
            onToast('Template analysis completed successfully!', 'success')
          }
        } else if (statusData.status === 'failed') {
          clearProgressSimulation() // Clear simulation on failure
          setAnalyzing(false)
          setAnalysisProgress(0)
          setAnalysisStartTime(null)
          onToast('Template analysis failed. Please try again.', 'error')
        }
      }
    } catch (error) {
      console.error('Failed to check analysis progress:', error)
    }
  }

  // Handle analysis triggering
  const handleAnalyzeTemplate = async () => {
    if (!template?.id) return

    try {
      setAnalyzing(true)
      setAnalysisProgress(0)
      setCurrentProgressStep(0)
      setAnalysisStartTime(Date.now())
      onToast('Starting template analysis...', 'info')

      // Start progress simulation immediately for better UX
      console.log('🎬 Calling startProgressSimulation from handleAnalyzeTemplate')
      startProgressSimulation()

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
        throw new Error('Failed to start template analysis')
      }

      const result = await response.json()
      
      if (result.success) {
        // Start polling for progress - delay longer to let simulation run
        console.log('✅ Analysis started successfully, will check backend status in 3 seconds')
        setTimeout(() => checkAnalysisProgress(), 3000)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Template analysis error:', error)
      clearProgressSimulation() // Clear simulation on error
      onToast('Template analysis failed. Please try again.', 'error')
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
  const hasAnalysis = template.analysis_cache?.summary || template.analysis_cache?.risks

  // Handle clicking on a risk to scroll to it in the template
  const handleRiskClick = (risk: any) => {
    // Check if the global scroll function is available
    if (typeof window !== 'undefined' && (window as any).scrollToTemplateRisk) {
      (window as any).scrollToTemplateRisk(risk.id || '')
    }
    
    // Switch to editor view on mobile when risk is clicked
    if (window.innerWidth <= 768) {
      // Template dashboard doesn't have mobile view switching currently
      // This could be added later if needed
    }
  }

  // Function to scroll to and highlight a specific risk card
  const scrollToRiskCard = useCallback((riskId: string) => {
    const riskElement = document.querySelector(`[data-risk-card-id="${riskId}"]`)
    if (riskElement) {
      riskElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // Add temporary emphasis to the risk card
      riskElement.classList.add(styles.emphasizedRiskCard || 'emphasized')
      setTimeout(() => {
        riskElement.classList.remove(styles.emphasizedRiskCard || 'emphasized')
      }, 3000)
    }
  }, [])

  // Expose scrollToRiskCard function globally
  useEffect(() => {
    if (template) {
      (window as any).scrollToTemplateRiskCard = scrollToRiskCard
    }
  }, [scrollToRiskCard, template])

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

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode)
    onToast(isEditMode ? 'Edit mode disabled' : 'Edit mode enabled - select text in the template to add variables', 'info')
    
    // Expose the add variable function globally for the template editor
    if (!isEditMode && typeof window !== 'undefined') {
      (window as any).addTemplateVariable = handleAddVariable
    } else if (typeof window !== 'undefined') {
      delete (window as any).addTemplateVariable
    }
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
      if (progressSimulation) {
        clearTimeout(progressSimulation)
      }
      // Clean up global function
      delete window.refreshTemplateVariables
    }
  }, [progressSimulation, template, loadTemplateVariables])

  // Handle risk resolution (new feature for templates)
  const handleResolveRisk = async (riskId: string) => {
    try {
      console.log('🔧 Resolving template risk:', { riskId, totalRisks: risks.length })
      console.log('📊 Available risk IDs:', risks.map(r => r.id))

      // Find the risk to resolve with more flexible matching
      let riskToResolve = risks.find(risk => risk.id === riskId)
      
      // If not found by exact ID, try by index-based ID
      if (!riskToResolve && riskId.includes('template-risk-')) {
        const index = parseInt(riskId.split('template-risk-')[1])
        riskToResolve = risks[index]
        console.log('📍 Found risk by index fallback:', { index, found: !!riskToResolve })
      }
      
      if (!riskToResolve) {
        console.error('❌ Risk not found for resolution:', riskId)
        onToast('Risk not found for resolution', 'error')
        return
      }

      console.log('✅ Found risk to resolve:', { id: riskToResolve.id, category: riskToResolve.category })

      // Add to resolved risks
      const currentResolvedRisks = template.resolved_risks || []
      const updatedResolvedRisks = [...currentResolvedRisks, { 
        ...riskToResolve, 
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'user'
      }]

      console.log('📝 Updating template with resolved risks:', { 
        templateId: template.id,
        currentResolvedCount: currentResolvedRisks.length,
        newResolvedCount: updatedResolvedRisks.length
      })

      // Update template with resolved risk
      const response = await fetch(`/api/template/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolved_risks: updatedResolvedRisks
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', { status: response.status, error: errorText })
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const updatedTemplate = await response.json()
      console.log('✅ Template updated successfully:', { 
        id: updatedTemplate.id,
        resolvedRisksCount: updatedTemplate.resolved_risks?.length || 0
      })
      
      onTemplateUpdate(updatedTemplate)

      // Update risks display (remove resolved risk)
      const updatedRisks = risks.filter(risk => risk.id !== riskToResolve.id)
      console.log('📊 Updated risks display:', { before: risks.length, after: updatedRisks.length })
      onRisksUpdate(updatedRisks)

      onToast('Template risk marked as resolved', 'success')
    } catch (error) {
      console.error('❌ Error resolving template risk:', error)
      onToast(`Failed to resolve risk: ${error.message}`, 'error')
    }
  }

  return (
    <div className={styles.analysisContainer}>
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
            disabled={analyzing}
          >
            {analyzing ? (
              analysisProgress <= 5 ? `Starting Analysis... ${analysisProgress}%` :
              analysisProgress <= 15 ? `Scanning Template... ${analysisProgress}%` :
              analysisProgress <= 45 ? `Processing Content... ${analysisProgress}%` :
              analysisProgress <= 80 ? `Analyzing Risks... ${analysisProgress}%` :
              analysisProgress < 100 ? `Finalizing... ${analysisProgress}%` : 'Complete!'
            ) : 'Analyze Template'}
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
                {analysisProgress <= 5 ? 'Analyzing template structure...' :
                 analysisProgress <= 15 ? 'Identifying template variables...' :
                 analysisProgress <= 30 ? 'Processing template content...' :
                 analysisProgress <= 45 ? 'Detecting potential risks...' :
                 analysisProgress <= 65 ? 'Analyzing template patterns...' :
                 analysisProgress <= 80 ? 'Finalizing analysis...' :
                 analysisProgress <= 90 ? 'Completing analysis...' :
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
        <button
          className={`${styles.tab} ${activeTab === 'risks' ? styles.active : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          Risk Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'summary' && (
          <div className={styles.summaryTab}>
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

        {activeTab === 'risks' && (
          <div className={styles.risks}>
            <div className={styles.riskAnalysisHeader}>
              <h3 className={styles.riskAnalysisTitle}>Template Risk Analysis</h3>
              
              {/* Smart Filtering Notification */}
              {template.analysis_cache?.risks?.smartFilteringApplied && (
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
                    <path d="M9 12l2 2 4-4"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  <div style={{ fontSize: '13px', color: '#075985' }}>
                    <strong>🎯 Smart Risk Detection:</strong> {template.analysis_cache.risks.duplicatesFiltered || 0} duplicate risk{(template.analysis_cache.risks.duplicatesFiltered || 0) !== 1 ? 's' : ''} filtered from {template.analysis_cache.risks.originalRisksFound || 0} originally detected.
                  </div>
                </div>
              )}
              
              <div className={styles.overallRiskScore}>
                <span className={styles.overallScoreLabel}>Overall Risk Score</span>
                <span className={styles.overallScoreValue}>
                  {risks.length > 0 
                    ? Math.round(risks.reduce((sum, risk) => sum + (risk.riskScore || 0), 0) / risks.length)
                    : 0}/10
                </span>
              </div>
              
              <div className={styles.riskSummary}>
                <div className={styles.riskCount}>
                  <span className={styles.totalRisks}>{risks.length}</span>
                  <span className={styles.totalRisksLabel}>risks identified</span>
                </div>
                
                <div className={styles.riskBreakdown}>
                  <div className={styles.riskBreakdownItem}>
                    <span className={`${styles.riskDot} ${styles.high}`}></span>
                    <span className={styles.riskBreakdownNumber}>{risks.filter(r => r.riskLevel === 'high').length}</span>
                    <span className={styles.riskBreakdownLabel}>high</span>
                  </div>
                  <div className={styles.riskBreakdownItem}>
                    <span className={`${styles.riskDot} ${styles.medium}`}></span>
                    <span className={styles.riskBreakdownNumber}>{risks.filter(r => r.riskLevel === 'medium').length}</span>
                    <span className={styles.riskBreakdownLabel}>medium</span>
                  </div>
                  <div className={styles.riskBreakdownItem}>
                    <span className={`${styles.riskDot} ${styles.low}`}></span>
                    <span className={styles.riskBreakdownNumber}>{risks.filter(r => r.riskLevel === 'low').length}</span>
                    <span className={styles.riskBreakdownLabel}>low</span>
                  </div>
                </div>
              </div>
            </div>
            
            {risks.length > 0 ? (
              <div className={styles.risksList}>
                {risks.map((risk, index) => (
                  <div 
                    key={risk.id || index} 
                    className={`${styles.riskItem} ${styles.clickableRisk}`}
                    onClick={() => handleRiskClick(risk)}
                    data-risk-card-id={risk.id || `template-risk-${index}`}
                  >
                    <div className={styles.riskHeader}>
                      <span className={`${styles.riskDot} ${styles[risk.riskLevel || 'medium']}`}></span>
                      <span className={styles.riskCategory}>
                        Template Risk {index + 1} of {risks.length} • {risk.category || 'General'} (Severity: {risk.riskScore || 5}/10)
                      </span>
                      <span className={styles.riskLevel}>{(risk.riskLevel || 'medium').toUpperCase()}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={styles.scrollIcon}
                      >
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                    <p className={styles.riskDescription}>{risk.explanation || 'No explanation provided'}</p>
                    <blockquote className={styles.riskQuote}>"{risk.clause || 'No clause identified'}"</blockquote>
                    <p className={styles.riskDetails}>
                      <strong>Location:</strong> {risk.clauseLocation || 'Not specified'}
                      {risk.affectedParty && (
                        <> | <strong>Affects:</strong> {risk.affectedParty}</>
                      )}
                    </p>
                    <p className={styles.riskMitigation}>
                      <strong>Recommendation:</strong> {risk.suggestion || 'No recommendation provided'}
                    </p>
                    {risk.legalPrecedent && (
                      <p className={styles.riskPrecedent}>
                        <strong>Legal Context:</strong> {risk.legalPrecedent}
                      </p>
                    )}
                    <div className={styles.riskActions}>
                      <button
                        className={styles.resolveButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResolveRisk(risk.id || `template-risk-${index}`)
                        }}
                        title="Mark this template risk as resolved"
                      >
                        ✓ Resolve
                      </button>
                    </div>
                    <div className={styles.scrollHint}>
                      <span>Click to scroll to text in template</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', textAlign: 'center', gap: '16px' }}>
                {hasAnalysis ? (
                  <>
                    <div style={{ fontSize: '48px' }}>✅</div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>No Active Risks Found</p>
                      <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '0', lineHeight: '1.5' }}>
                        {template.analysis_cache?.risks?.smartFilteringApplied 
                          ? `All risks have been resolved or filtered as duplicates. ${template.analysis_cache.risks.duplicatesFiltered || 0} duplicate${(template.analysis_cache.risks.duplicatesFiltered || 0) !== 1 ? 's' : ''} were automatically filtered.`
                          : 'All risks have been resolved or no risks were detected in this template.'
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px' }}>🔍</div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>No Risk Analysis Yet</p>
                      <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '0', lineHeight: '1.5' }}>Run analysis to identify potential template risks and get AI-powered insights.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Resolved Risks Section */}
            {template.resolved_risks && template.resolved_risks.length > 0 && (
              <div className={styles.resolvedRisksSection}>
                <h3>Resolved Template Risks ({template.resolved_risks.length})</h3>
                <div className={styles.resolvedRisksList}>
                  {template.resolved_risks.map((resolvedRisk, index) => (
                    <div key={index} className={styles.resolvedRiskCard}>
                      <div className={styles.resolvedHeader}>
                        <span className={styles.resolvedBadge}>RESOLVED</span>
                        <span className={styles.resolvedDate}>
                          {new Date(resolvedRisk.resolvedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h5>{resolvedRisk.category}</h5>
                      <p>{resolvedRisk.explanation}</p>
                    </div>
                  ))}
                </div>
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