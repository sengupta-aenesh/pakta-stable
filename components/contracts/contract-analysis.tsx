'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Contract, RiskFactor, ContractSummary, MissingInfoItem } from '@/lib/types'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import styles from './contract-analysis.module.css'

interface ContractAnalysisProps {
  contract: Contract | null
  onMobileViewChange?: (view: 'list' | 'editor' | 'analysis') => void
  mobileView?: 'list' | 'editor' | 'analysis'
  onRisksUpdate?: (risks: RiskFactor[]) => void
  onReanalysisRequest?: (reanalyzeRisks: () => Promise<void>) => void
  onContractUpdate?: (updatedContent: string) => void
}

export function ContractAnalysis({ contract, onMobileViewChange, mobileView, onRisksUpdate, onReanalysisRequest, onContractUpdate }: ContractAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'complete' | 'risks' | 'chat'>('summary')
  const [summary, setSummary] = useState<ContractSummary | null>(null)
  const [risks, setRisks] = useState<RiskFactor[]>([])
  const [missingInfo, setMissingInfo] = useState<MissingInfoItem[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<{status: string, progress: number} | null>(null)
  
  // Track pending requests to prevent duplicate API calls
  const pendingRequests = useRef<{ [key: string]: boolean }>({
    summary: false,
    complete: false,
    risks: false,
    chat: false
  })

  // Handle clicking on a risk to scroll to it in the editor
  const handleRiskClick = (risk: RiskFactor) => {
    // Check if the global scroll function is available
    if (typeof window !== 'undefined' && (window as any).scrollToContractRisk) {
      (window as any).scrollToContractRisk(risk.id || '')
    }
    
    // Switch to editor view on mobile when risk is clicked
    if (onMobileViewChange && window.innerWidth <= 768) {
      onMobileViewChange('editor')
    }
  }

  // Helper function to get progress description
  const getProgressDescription = (progress: number): string => {
    if (progress < 10) return "Loading jurisdiction settings..."
    if (progress < 15) return "Searching jurisdiction requirements..."
    if (progress < 30) return "Reading and understanding your contract..."
    if (progress < 60) return "Identifying key terms and clauses..."
    if (progress < 80) return "Analyzing risks and compliance issues..."
    if (progress < 95) return "Finalizing comprehensive analysis..."
    return "Almost complete! Preparing results..."
  }

  // Function to reload contract data with fresh cache
  const reloadContractData = useCallback(async () => {
    if (!contract?.id) return
    
    try {
      console.log('🔄 Reloading contract data for ID:', contract.id)
      
      // Call the global refresh function from dashboard if available
      if (typeof window !== 'undefined' && (window as any).refreshCurrentContract) {
        console.log('🔄 Using global refresh function...')
        await (window as any).refreshCurrentContract()
        console.log('✅ Contract data refreshed via global function')
      } else {
        console.warn('⚠️ Global refresh function not available, analysis results may not appear immediately')
      }
    } catch (error) {
      console.error('Failed to reload contract data:', error)
    }
  }, [contract?.id])

  // Function to scroll to and highlight a specific risk card
  const scrollToRiskCard = useCallback((riskId: string) => {
    const riskElement = document.querySelector(`[data-risk-card-id="${riskId}"]`)
    if (riskElement) {
      riskElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // Add temporary emphasis to the risk card
      riskElement.classList.add(styles.emphasizedRiskCard)
      setTimeout(() => {
        riskElement.classList.remove(styles.emphasizedRiskCard)
      }, 3000)
    }
  }, [])

  // Expose scrollToRiskCard function globally
  useEffect(() => {
    if (contract) {
      (window as any).scrollToRiskCard = scrollToRiskCard
    }
  }, [scrollToRiskCard, contract])

  // Check analysis progress for the current contract with debouncing
  const progressCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const checkAnalysisProgress = useCallback(async () => {
    if (!contract) return
    
    // Clear any existing timeout to prevent multiple concurrent checks
    if (progressCheckTimeoutRef.current) {
      clearTimeout(progressCheckTimeoutRef.current)
      progressCheckTimeoutRef.current = null
    }
    
    try {
      const response = await fetch(`/api/contract/analysis-status?contractId=${contract.id}`)
      if (response.ok) {
        const statusData = await response.json()
        
        // Only log significant status changes to reduce console noise
        if (statusData.status === 'complete' || statusData.status === 'failed' || statusData.progress % 25 === 0) {
          console.log('📊 Analysis status:', statusData.status, `${statusData.progress}%`)
        }
        
        // Check if analysis is still running (any status that's not complete or failed)
        const isAnalysisRunning = statusData.status === 'in_progress' || 
                                 statusData.status === 'pending' || 
                                 statusData.status === 'summary_complete' || 
                                 statusData.status === 'risks_complete'
        
        console.log('🔍 Analysis status check:', {
          status: statusData.status,
          progress: statusData.progress,
          isAnalysisRunning,
          shouldContinuePolling: isAnalysisRunning && statusData.progress < 100
        })
        
        if (isAnalysisRunning && statusData.progress < 100) {
          setAnalysisProgress({
            status: statusData.status,
            progress: statusData.progress
          })
          setIsAnalyzing(true)
          
          // Continue polling while analysis is running, but only if contract hasn't changed
          progressCheckTimeoutRef.current = setTimeout(() => {
            if (contract?.id === statusData.contractId) { // statusData.contractId comes from API response
              console.log('🔄 Continuing progress check for contract:', contract.id, 'status:', statusData.status)
              checkAnalysisProgress()
            } else {
              console.log('⏹️ Stopping progress check - contract changed from', statusData.contractId, 'to', contract?.id)
            }
          }, 3000)
        } else if (statusData.status === 'complete') {
          console.log('🎉 Analysis completed! Refreshing contract data...')
          setAnalysisProgress(null)
          setIsAnalyzing(false)
          
          // Reload the current contract data to get fresh cache
          await reloadContractData()
          
          // Force refresh after delay to ensure fresh data loads
          setTimeout(() => {
            console.log('🔄 Force refreshing contract after analysis completion...')
            if (typeof window !== 'undefined' && (window as any).refreshCurrentContract) {
              (window as any).refreshCurrentContract()
            }
          }, 1000)
        } else if (statusData.status === 'failed') {
          console.error('❌ Analysis failed:', statusData.error)
          setAnalysisProgress(null)
          setIsAnalyzing(false)
          alert(`Analysis failed: ${statusData.error || 'Unknown error'}. Please try again.`)
        } else {
          setAnalysisProgress(null)
          setIsAnalyzing(false)
        }
      }
    } catch (error) {
      console.error('Error checking analysis progress:', error)
      setAnalysisProgress(null)
      setIsAnalyzing(false)
    }
  }, [contract, reloadContractData])
  
  // Cleanup progress checking timeout
  useEffect(() => {
    return () => {
      if (progressCheckTimeoutRef.current) {
        clearTimeout(progressCheckTimeoutRef.current)
        progressCheckTimeoutRef.current = null
      }
    }
  }, [contract?.id])

  useEffect(() => {
    if (contract) {
      // Clear previous contract's data first to prevent conflicts
      setSummary(null)
      setRisks([])
      setMissingInfo([])
      setChatMessages([])
      
      // Check if analysis is in progress (but don't trigger progress monitoring)
      if (contract.analysis_status === 'in_progress' || 
          contract.analysis_status === 'summary_complete' || 
          contract.analysis_status === 'risks_complete') {
        console.log('📊 Contract has analysis in progress, starting monitoring:', contract.analysis_status)
        setAnalysisProgress({ status: contract.analysis_status, progress: contract.analysis_progress || 0 })
        setIsAnalyzing(true)
        checkAnalysisProgress() // Only start monitoring if analysis is actually running
      } else {
        console.log('📊 Contract analysis not in progress, status:', contract.analysis_status)
        setAnalysisProgress(null)
        setIsAnalyzing(false)
      }
      
      // Then load cached data for the new contract if available
      
      if (contract.analysis_cache?.summary) {
        // Check if cached summary has the new structure
        const cachedSummary = contract.analysis_cache.summary as any
        if (cachedSummary.overview || cachedSummary.contract_type) {
          setSummary(cachedSummary as ContractSummary)
        } else {
          setSummary(null)
        }
      } else {
        setSummary(null)
      }
      if (contract.analysis_cache?.complete) {
        const cachedMissingInfo = contract.analysis_cache.complete.missingInfo as MissingInfoItem[] || []
        setMissingInfo(cachedMissingInfo)
      }
      if (contract.analysis_cache?.risks) {
        // Handle both old and new cache structure formats
        const riskData = contract.analysis_cache.risks
        const cachedRisks = Array.isArray(riskData) 
          ? riskData  // Old direct array format
          : riskData?.risks || []  // New RiskAnalysis object format
        setRisks(cachedRisks)
        // Update parent component with cached risks
        if (onRisksUpdate) {
          onRisksUpdate(cachedRisks)
        }
      } else {
        setRisks([])
      }
      if (contract.analysis_cache?.chat) {
        setChatMessages(contract.analysis_cache.chat as Array<{role: string, content: string}>)
      }
    } else {
      // No contract selected, clear everything
      setSummary(null)
      setRisks([])
      setMissingInfo([])
      setChatMessages([])
    }
  }, [contract?.id, contract?.analysis_cache]) // Watch both contract ID and analysis cache for updates

  // Cleanup function to prevent memory leaks when switching contracts
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts or contract changes
      setAnalysisProgress(null)
      setIsAnalyzing(false)
    }
  }, [contract?.id])

  const analyzeContract = useCallback(async (type: 'summary' | 'complete' | 'risks', forceRefresh = false) => {
    if (!contract) return

    // Check if a request is already pending for this type
    if (pendingRequests.current[type]) {
      console.log(`⚠️ Request already pending for ${type}, skipping duplicate call`)
      return
    }

    // Check if we already have cached data (unless forcing refresh)
    if (!forceRefresh) {
      if (type === 'summary' && summary) return
      if (type === 'complete' && missingInfo.length > 0) return
      if (type === 'risks' && risks.length > 0) return
    }

    // Mark request as pending
    pendingRequests.current[type] = true
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/contract/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId: contract.id, 
          content: contract.content, 
          type,
          comprehensiveAnalysis: type === 'risks' 
        })
      })
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('You have reached your analysis limit. Please upgrade your subscription.')
          return
        }
        throw new Error(`Analysis failed: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📋 Analysis response received:', { type, data: typeof data, hasData: !!data })
      
      // Check for validation error
      if (data.error === 'NOT_A_CONTRACT') {
        alert(data.message || 'This document does not appear to be a legal contract. Please upload a valid contract document.')
        return
      }
      
      if (type === 'summary') {
        console.log('✅ Setting summary data:', data)
        setSummary(data)  // API now returns summary directly
      } else if (type === 'complete') {
        const newMissingInfo = data.missingInfo || []
        setMissingInfo(newMissingInfo)
        
        // Log processing steps if available
        if (data.processingSteps) {
          console.log('📊 Contract Processing Results:', data.processingSteps)
          
          // Auto-update contract content with processed version (blanks converted to brackets)
          if (data.processedContent && data.processedContent !== contract?.content) {
            console.log('🔄 Updating contract with processed content (blanks converted to brackets)')
            if (onContractUpdate) {
              onContractUpdate(data.processedContent)
              console.log('✅ Contract content updated with processed version')
            } else if (typeof window !== 'undefined' && (window as any).updateContractContent) {
              (window as any).updateContractContent(data.processedContent)
              console.log('✅ Contract content updated via global function')
            }
          }
        }
      } else {
        // Handle RiskAnalysis object format
        console.log('📊 Setting risk analysis data:', data)
        const riskAnalysisData = data
        const newRisks = riskAnalysisData.risks || []
        console.log('✅ Extracted', newRisks.length, 'risks from analysis data')
        setRisks(newRisks)
        // Update parent component with new risks
        if (onRisksUpdate) {
          onRisksUpdate(newRisks)
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Error analyzing contract. Please try again.')
    } finally {
      // Clear pending request flag
      pendingRequests.current[type] = false
      
      // Only clear isAnalyzing if no other requests are pending
      const hasOtherPendingRequests = Object.keys(pendingRequests.current).some(
        key => key !== type && pendingRequests.current[key]
      )
      if (!hasOtherPendingRequests) {
        setIsAnalyzing(false)
      }
    }
  }, [contract, summary, missingInfo, risks, onRisksUpdate])

  // Create a reanalysis function specifically for risks
  const reanalyzeRisks = useCallback(async () => {
    console.log('🔄 Triggering risk reanalysis after redraft...')
    await analyzeContract('risks', true) // Force refresh risks
  }, [analyzeContract])

  // Expose reanalysis function to parent component
  useEffect(() => {
    if (onReanalysisRequest && contract && reanalyzeRisks) {
      onReanalysisRequest(reanalyzeRisks)
    }
  }, [contract?.id]) // Only depend on contract ID, not the callback functions

  // Handle missing info input changes
  const handleMissingInfoChange = (id: string, value: string) => {
    setMissingInfo(prev => 
      prev.map(item => 
        item.id === id ? { ...item, userInput: value } : item
      )
    )
  }

  // Function to format date to standardized format
  const formatToStandardDate = (dateInput: string, fieldType: string) => {
    if (fieldType !== 'date') return dateInput
    
    try {
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) return dateInput
      
      const day = date.getDate()
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      
      // Convert day to ordinal (1st, 2nd, 3rd, 4th, etc.)
      const getOrdinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd']
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
      }
      
      return `${getOrdinal(day)} day of ${month}, ${year}`
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateInput
    }
  }

  // Apply all changes to the contract content
  const applyAllChanges = () => {
    if (!contract) {
      console.log('❌ No contract available')
      return
    }
    
    let updatedContent = contract.content || ''
    console.log('🔄 Starting to apply changes to content:', { 
      originalLength: updatedContent.length,
      missingInfoCount: missingInfo.length,
      itemsWithInput: missingInfo.filter(item => item.userInput.trim()).length,
      hasBrackets: (updatedContent.match(/\[.*?\]/g) || []).length > 0
    })
    
    // Collect all replacements with positions for batch processing
    const allReplacements: Array<{
      start: number
      end: number
      originalText: string
      newText: string
      item: any
    }> = []
    
    // Process each missing info item that has user input
    missingInfo.forEach(item => {
      if (item.userInput.trim()) {
        // Format the input based on field type
        const formattedInput = formatToStandardDate(item.userInput, item.fieldType)
        console.log(`🔧 Collecting replacements for: ${item.label} = "${item.userInput}" → "${formattedInput}"`)
        
        item.occurrences.forEach((occurrence: any) => {
          // Validate position and text match
          if (occurrence.position && occurrence.position.start >= 0 && occurrence.position.end > occurrence.position.start) {
            const textAtPosition = updatedContent.substring(occurrence.position.start, occurrence.position.end)
            
            // Verify the text at position matches what we expect to replace
            if (textAtPosition === occurrence.text) {
              allReplacements.push({
                start: occurrence.position.start,
                end: occurrence.position.end,
                originalText: occurrence.text,
                newText: formattedInput,
                item: item
              })
              console.log(`    ✅ Valid replacement: "${textAtPosition}" → "${formattedInput}" at ${occurrence.position.start}-${occurrence.position.end}`)
            } else {
              // Position doesn't match, try to find the text nearby or use fuzzy matching
              const searchRadius = 100 // Search within 100 characters
              const searchStart = Math.max(0, occurrence.position.start - searchRadius)
              const searchEnd = Math.min(updatedContent.length, occurrence.position.end + searchRadius)
              const searchArea = updatedContent.substring(searchStart, searchEnd)
              const relativeIndex = searchArea.indexOf(occurrence.text)
              
              if (relativeIndex !== -1) {
                const actualStart = searchStart + relativeIndex
                const actualEnd = actualStart + occurrence.text.length
                allReplacements.push({
                  start: actualStart,
                  end: actualEnd,
                  originalText: occurrence.text,
                  newText: formattedInput,
                  item: item
                })
                console.log(`    🔍 Found text nearby: "${occurrence.text}" → "${formattedInput}" at ${actualStart}-${actualEnd}`)
              } else {
                // Last resort: find first occurrence of text
                const globalIndex = updatedContent.indexOf(occurrence.text)
                if (globalIndex !== -1) {
                  allReplacements.push({
                    start: globalIndex,
                    end: globalIndex + occurrence.text.length,
                    originalText: occurrence.text,
                    newText: formattedInput,
                    item: item
                  })
                  console.log(`    🌐 Found text globally: "${occurrence.text}" → "${formattedInput}" at ${globalIndex}-${globalIndex + occurrence.text.length}`)
                } else {
                  console.warn(`    ❌ Could not find text "${occurrence.text}" for replacement`)
                }
              }
            }
          } else {
            // No position provided, find first occurrence
            const globalIndex = updatedContent.indexOf(occurrence.text)
            if (globalIndex !== -1) {
              allReplacements.push({
                start: globalIndex,
                end: globalIndex + occurrence.text.length,
                originalText: occurrence.text,
                newText: formattedInput,
                item: item
              })
              console.log(`    🔍 Found text without position: "${occurrence.text}" → "${formattedInput}" at ${globalIndex}`)
            } else {
              console.warn(`    ❌ Could not find text "${occurrence.text}" for replacement`)
            }
          }
        })
      }
    })
    
    // Sort replacements by position (end to start) to avoid position shifts
    allReplacements.sort((a, b) => b.start - a.start)
    
    // Apply all replacements in order
    allReplacements.forEach((replacement, index) => {
      console.log(`🔧 Applying replacement ${index + 1}/${allReplacements.length}: "${replacement.originalText}" → "${replacement.newText}" at ${replacement.start}-${replacement.end}`)
      
      // Verify the text is still at the expected position
      const currentTextAtPosition = updatedContent.substring(replacement.start, replacement.end)
      if (currentTextAtPosition === replacement.originalText) {
        const before = updatedContent.substring(0, replacement.start)
        const after = updatedContent.substring(replacement.end)
        updatedContent = before + replacement.newText + after
        console.log(`    ✅ Replacement successful`)
      } else {
        console.warn(`    ⚠️ Text mismatch at position ${replacement.start}: expected "${replacement.originalText}", found "${currentTextAtPosition}"`)
        // Try one more time with global replacement for this specific occurrence
        const beforeGlobal = updatedContent
        updatedContent = updatedContent.replace(replacement.originalText, replacement.newText)
        if (updatedContent !== beforeGlobal) {
          console.log(`    🔄 Fallback global replacement successful`)
        } else {
          console.warn(`    ❌ Fallback replacement also failed`)
        }
      }
    })
    
    console.log('📊 Replacement complete:', { 
      newLength: updatedContent.length,
      changed: updatedContent !== contract.content,
      replacementsAttempted: allReplacements.length
    })
    
    // Update the contract content through multiple methods
    let updateSuccessful = false
    
    // Method 1: Try direct prop callback
    if (onContractUpdate) {
      console.log('🔄 Method 1: Using onContractUpdate prop')
      try {
        onContractUpdate(updatedContent)
        updateSuccessful = true
        console.log('✅ Prop-based update successful')
      } catch (error) {
        console.log('❌ Prop-based update failed:', error)
      }
    }
    
    // Method 2: Try global function (fallback)
    if (!updateSuccessful && typeof window !== 'undefined' && (window as any).updateContractContent) {
      console.log('🔄 Method 2: Calling global updateContractContent function')
      try {
        ;(window as any).updateContractContent(updatedContent)
        updateSuccessful = true
        console.log('✅ Global function update successful')
      } catch (error) {
        console.log('❌ Global function update failed:', error)
      }
    }
    
    if (!updateSuccessful) {
      console.log('❌ All update methods failed - manual refresh may be required')
      alert('Changes applied! Please refresh the page to see the updated contract.')
    }
    
    console.log('✅ Applied all missing info changes to contract')
  }

  const sendMessage = async () => {
    if (!contract || !newMessage.trim() || isLoading) return
    
    setIsLoading(true)
    const messageText = newMessage
    const userMessage = { role: 'user', content: messageText }
    setChatMessages(prev => [...prev, userMessage])
    setNewMessage('')
    
    try {
      const response = await fetch('/api/contract/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId: contract.id, 
          content: contract.content, 
          type: 'chat',
          question: messageText,
          previousMessages: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab clicks - should NOT trigger automatic analysis anymore
  const handleTabClick = (tab: 'summary' | 'complete' | 'risks' | 'chat') => {
    setActiveTab(tab)
    
    // DO NOT auto-analyze anymore - all analysis should happen automatically on upload
    // Users can manually refresh if needed using the "Refresh All" button
    console.log('📑 Tab clicked:', tab, 'Available cached data:', {
      summary: !!summary,
      risks: risks.length,
      complete: missingInfo.length,
      chat: chatMessages.length
    })
  }

  if (!contract) {
    return (
      <div className={styles.noContract}>
        <p>Select a contract to view analysis</p>
      </div>
    )
  }

  const overallRiskScore = risks.length > 0 
    ? Math.min(Math.round(risks.reduce((sum, risk) => sum + Math.min(Math.max(risk.riskScore || 5, 1), 10), 0) / risks.length), 10)
    : 0

  return (
    <div className={styles.container}>
      {/* Header - Updated to match template dashboard style */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Contract Analysis</h2>
          <div className={styles.status} style={{ color: analysisProgress ? '#F59E0B' : '#10B981' }}>
            {analysisProgress ? `Analyzing... ${analysisProgress.progress}%` : contract ? 'Ready for analysis' : 'No contract selected'}
          </div>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button"
            className={`${styles.refreshButton} ${styles.analyzeButton}`}
            onClick={async () => {
              if (!contract?.id) return
              
              console.log('🔄 Starting analysis for contract:', contract.id)
              
              try {
                // Clear current data first
                setSummary(null)
                setRisks([])
                setMissingInfo([])
                setChatMessages([])
                
                const response = await fetch('/api/contract/refresh-analysis', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contractId: contract.id })
                })
                
                if (response.ok) {
                  const responseData = await response.json()
                  console.log('✅ Analysis started successfully')
                  
                  setAnalysisProgress({ status: 'in_progress', progress: 0 })
                  setIsAnalyzing(true)
                  
                  // Start checking progress immediately
                  checkAnalysisProgress()
                } else {
                  const errorData = await response.json()
                  console.error('❌ Analysis API failed:', errorData)
                  throw new Error(errorData.error || 'Failed to start analysis')
                }
              } catch (error) {
                console.error('❌ Failed to start analysis:', error)
                alert(`Failed to start analysis: ${error.message}. Please try again.`)
              }
            }}
          >
            {analysisProgress ? 'Analyzing...' : 'Analyze Contract'}
          </button>
        </div>
      </div>

      {/* Progress Bar - Add below header like template dashboard */}
      {analysisProgress && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${analysisProgress.progress}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {analysisProgress.progress}% complete - {getProgressDescription(analysisProgress.progress)}
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button 
          type="button"
          className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
          onClick={() => handleTabClick('summary')}
        >
          Summary
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${activeTab === 'complete' ? styles.active : ''}`}
          onClick={() => handleTabClick('complete')}
        >
          Complete
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${activeTab === 'risks' ? styles.active : ''}`}
          onClick={() => handleTabClick('risks')}
        >
          Analysis
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => handleTabClick('chat')}
        >
          AI Chat
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'summary' && (
          <div className={styles.summary}>
            {isAnalyzing ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px', color: '#6b7280' }}>
                <span>Analyzing contract...</span>
              </div>
            ) : summary ? (
              <>
                <h3>Contract Summary</h3>
                <p>{summary.overview || 'No overview available'}</p>
                
                {summary.contract_type && (
                  <>
                    <h4>Contract Type</h4>
                    <p>{summary.contract_type}</p>
                  </>
                )}
                
                <h4>Key Terms</h4>
                <div className={styles.keyTerms}>
                  {summary.key_terms && typeof summary.key_terms === 'object' ? (
                    <>
                      {summary.key_terms.duration && (
                        <div className={styles.term}>
                          <strong>Duration:</strong>
                          <span>{summary.key_terms.duration}</span>
                        </div>
                      )}
                      {summary.key_terms.value && (
                        <div className={styles.term}>
                          <strong>Value:</strong>
                          <span>{summary.key_terms.value}</span>
                        </div>
                      )}
                      {summary.key_terms.payment_terms && (
                        <div className={styles.term}>
                          <strong>Payment Terms:</strong>
                          <span>{summary.key_terms.payment_terms}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>Could not identify key terms</p>
                  )}
                </div>
                
                {summary.important_dates && Array.isArray(summary.important_dates) && summary.important_dates.length > 0 && (
                  <>
                    <h4>Important Dates</h4>
                    <ul>
                      {summary.important_dates.map((date, index) => (
                        <li key={index}>{String(date) || 'Not specified'}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                <h4>Parties Involved</h4>
                {summary.parties && Array.isArray(summary.parties) && summary.parties.length > 0 ? (
                  <ul>
                    {summary.parties.map((party, index) => (
                      <li key={index}>{String(party) || 'Not specified'}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Could not identify parties</p>
                )}
                
                {summary.obligations && Array.isArray(summary.obligations) && summary.obligations.length > 0 && (
                  <>
                    <h4>Key Obligations</h4>
                    <ul>
                      {summary.obligations.map((obligation, index) => (
                        <li key={index}>{String(obligation) || 'Not specified'}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                <p>Click to analyze the contract summary</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'complete' && (
          <div className={styles.complete}>
            <h3>Complete Contract</h3>
            {isAnalyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px', color: '#6b7280' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div className={styles.processingSteps}>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>1</span>
                      <span>Converting blanks to bracketed placeholders...</span>
                    </div>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>2</span>
                      <span>Extracting fields for user input...</span>
                    </div>
                    <div className={styles.processingStep}>
                      <span className={styles.stepNumber}>3</span>
                      <span>Mapping field occurrences...</span>
                    </div>
                  </div>
                </div>
                <span>Processing contract for completion...</span>
              </div>
            ) : missingInfo.length > 0 ? (
              <>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Fill in the missing information below. Changes will be applied to all occurrences in the contract.
                </p>
                
                {missingInfo.map((item, index) => (
                  <div key={item.id} className={styles.missingInfoItem}>
                    <div className={styles.missingInfoHeader}>
                      <label className={styles.missingInfoLabel}>
                        {item.label}
                      </label>
                      <span className={styles.occurrenceCount}>
                        {item.occurrences.length} occurrence{item.occurrences.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className={styles.missingInfoDescription}>{item.description}</p>
                    {item.legalContext && (
                      <div className={styles.legalContextInfo}>
                        <span className={styles.legalContextLabel}>Legal Context:</span>
                        <span className={styles.legalContextText}>{item.legalContext}</span>
                      </div>
                    )}
                    {item.context && (
                      <div className={styles.contextInfo}>
                        <span className={styles.contextLabel}>Context:</span>
                        <code className={styles.contextText}>{item.context}</code>
                      </div>
                    )}
                    <input
                      type={item.fieldType === 'date' ? 'date' : item.fieldType === 'number' ? 'number' : item.fieldType === 'email' ? 'email' : 'text'}
                      className={styles.missingInfoInput}
                      placeholder={item.placeholder}
                      value={item.userInput}
                      onChange={(e) => handleMissingInfoChange(item.id, e.target.value)}
                    />
                    {item.userInput && (
                      <div className={styles.previewContainer}>
                        <div className={styles.previewNote}>
                          ✓ Will replace: {item.occurrences.map(occ => `"${occ.text}"`).join(', ')}
                        </div>
                        {item.context && (
                          <div className={styles.previewResult}>
                            <span className={styles.previewLabel}>Preview:</span>
                            <code className={styles.previewText}>
                              {item.context.replace(
                                item.occurrences[0]?.text || '', 
                                formatToStandardDate(item.userInput, item.fieldType)
                              )}
                            </code>
                          </div>
                        )}
                        {item.fieldType === 'date' && (
                          <div className={styles.previewResult}>
                            <span className={styles.previewLabel}>Formatted as:</span>
                            <code className={styles.previewText}>
                              {formatToStandardDate(item.userInput, item.fieldType)}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className={styles.applyChangesButton}
                    onClick={applyAllChanges}
                    disabled={!missingInfo.some(item => item.userInput.trim())}
                  >
                    Apply All Changes to Contract
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                <p>No missing information detected in this contract</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className={styles.risks}>
            <div className={styles.riskAnalysisHeader}>
              <h3 className={styles.riskAnalysisTitle}>Risk Analysis</h3>
              
              <div className={styles.overallRiskScore}>
                <span className={styles.overallScoreLabel}>Overall Risk Score</span>
                <span className={styles.overallScoreValue}>{overallRiskScore.toFixed(0)}/10</span>
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
            
            {isAnalyzing ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px', color: '#6b7280' }}>
                <span>Performing comprehensive risk analysis...</span>
              </div>
            ) : risks.length > 0 ? (
              <div className={styles.risksList}>
                
                {risks.map((risk, index) => (
                  <div 
                    key={risk.id || index} 
                    className={`${styles.riskItem} ${styles.clickableRisk}`}
                    onClick={() => handleRiskClick(risk)}
                    data-risk-card-id={risk.id || `risk-${index}`}
                  >
                    <div className={styles.riskHeader}>
                      <span className={`${styles.riskDot} ${styles[risk.riskLevel || 'medium']}`}></span>
                      <span className={styles.riskCategory}>
                        Risk {index + 1} of {risks.length} • {risk.category} (Severity: {risk.riskScore}/10)
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
                    <p className={styles.riskDescription}>{risk.explanation}</p>
                    <blockquote className={styles.riskQuote}>"{risk.clause}"</blockquote>
                    <p className={styles.riskDetails}>
                      <strong>Location:</strong> {risk.clauseLocation}
                      {risk.affectedParty && (
                        <> | <strong>Affects:</strong> {risk.affectedParty}</>
                      )}
                    </p>
                    <p className={styles.riskMitigation}>
                      <strong>Recommendation:</strong> {risk.suggestion}
                    </p>
                    {risk.legalPrecedent && (
                      <p className={styles.riskPrecedent}>
                        <strong>Legal Context:</strong> {risk.legalPrecedent}
                      </p>
                    )}
                    <div className={styles.scrollHint}>
                      <span>Click to scroll to text in document</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                <p>Click to analyze contract risks</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className={styles.chat}>
            <div className={styles.messages}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
                  <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about this contract..."
                disabled={isLoading}
              />
              <button type="button" onClick={sendMessage} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}