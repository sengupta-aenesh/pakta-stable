'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Template, RiskFactor, UserCreatedVariable } from '@/lib/types'
import SelectionToolbar from '../contracts/selection-toolbar'
import styles from './interactive-template-editor.module.css'

// Document export utilities - adapted for templates
async function downloadTemplateDocx(content: string, title: string) {
  try {
    const response = await fetch('/api/template/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        title, 
        format: 'docx' 
      })
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('DOCX export failed:', error)
    alert('Failed to export DOCX. Please try again.')
  }
}

async function downloadTemplatePdf(content: string, title: string) {
  try {
    const response = await fetch('/api/template/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        title, 
        format: 'pdf' 
      })
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const html = await response.text()
    
    // Open the HTML in a new window and trigger print dialog
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Close the window after printing (optional)
          printWindow.onafterprint = () => printWindow.close()
        }, 500)
      }
    } else {
      throw new Error('Popup blocked. Please allow popups for PDF export.')
    }
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('Failed to export PDF. Please try again.')
  }
}

interface TextPosition {
  start: number
  end: number
}

interface RiskHighlight {
  id: string
  clause: string
  clauseLocation: string
  riskLevel: 'high' | 'medium' | 'low'
  riskScore: number
  category: string
  explanation: string
  suggestion: string
  legalPrecedent?: string
  affectedParty: string
  textPosition: TextPosition
  elementId: string
}

interface TextSelection {
  text: string
  position: { x: number; y: number }
  range: Range
}

interface InteractiveTemplateEditorProps {
  template: Template | null
  templateVariables?: Array<{
    id: string
    label: string
    userInput: string
    fieldType: string
    occurrences?: Array<{
      text: string
      position: number
    }>
  }>
  onContentChange: (content: string) => void
  onComment?: (text: string, position: TextPosition) => void
  onReanalyzeRisks?: (() => Promise<void>) | null
  onRegisterUpdateFunction?: (updateFunction: (content: string | null) => void) => void
  className?: string
  isVersionMode?: boolean
  versionData?: {
    variables: Array<{
      id: string
      label: string
      value: string
      fieldType: string
    }>
    versionName: string
  }
  onBackToOriginal?: () => void
  onEditModeChange?: (isEditing: boolean) => void
}

export default function InteractiveTemplateEditor({
  template,
  templateVariables,
  onContentChange,
  onComment,
  onReanalyzeRisks,
  onRegisterUpdateFunction,
  className,
  isVersionMode = false,
  versionData,
  onBackToOriginal,
  onEditModeChange
}: InteractiveTemplateEditorProps) {
  const [content, setContent] = useState('')
  const [editingContent, setEditingContent] = useState('') // Separate state for editing
  const [riskHighlights, setRiskHighlights] = useState<RiskHighlight[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)
  const [isVariableMode, setIsVariableMode] = useState(false)
  const [variableSelectionEnabled, setVariableSelectionEnabled] = useState(false)
  const [showVariableDropdown, setShowVariableDropdown] = useState(false)
  const [showCreateVariableModal, setShowCreateVariableModal] = useState(false)
  const [showRenameVariableModal, setShowRenameVariableModal] = useState(false)
  const [variableToRename, setVariableToRename] = useState<string | null>(null)
  const [variableSearch, setVariableSearch] = useState('')
  const [newVariableForm, setNewVariableForm] = useState({
    label: '',
    description: '',
    fieldType: 'text' as 'text' | 'email' | 'number' | 'date'
  })
  const [renameVariableForm, setRenameVariableForm] = useState({
    label: '',
    description: ''
  })
  const [allVariables, setAllVariables] = useState<Array<{
    id: string
    label: string
    fieldType: string
    description?: string
    occurrences: number
    isUserCreated?: boolean
  }>>([])
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)
  const variableDropdownRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Count variable occurrences in content
  const countVariableOccurrences = useCallback((variableLabel: string, contentToSearch: string): number => {
    const variablePattern = `{{${variableLabel.replace(/\s+/g, '_')}}}`
    const regex = new RegExp(variablePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = contentToSearch.match(regex)
    return matches ? matches.length : 0
  }, [])

  // Merge AI-detected and user-created variables
  const mergeVariables = useCallback(() => {
    const mergedVars: Array<{
      id: string
      label: string
      fieldType: string
      description?: string
      occurrences: number
      isUserCreated?: boolean
    }> = []

    // Add user-created variables first
    if (template?.user_created_variables) {
      template.user_created_variables.forEach(userVar => {
        mergedVars.push({
          ...userVar,
          occurrences: countVariableOccurrences(userVar.label, editingContent || content),
          isUserCreated: true
        })
      })
    }

    // Add AI-detected variables from templateVariables prop
    if (templateVariables) {
      templateVariables.forEach(aiVar => {
        // Check if this variable already exists in user-created
        const exists = mergedVars.some(v => v.label.toLowerCase() === aiVar.label.toLowerCase())
        if (!exists) {
          mergedVars.push({
            id: aiVar.id,
            label: aiVar.label,
            fieldType: aiVar.fieldType,
            occurrences: countVariableOccurrences(aiVar.label, editingContent || content),
            isUserCreated: false
          })
        }
      })
    }

    setAllVariables(mergedVars)
  }, [template, templateVariables, content, editingContent, countVariableOccurrences])

  // Document beautification function
  const beautifyContent = useCallback((rawContent: string): string => {
    if (!rawContent) return ''
    
    let beautified = rawContent
    
    // Clean up excessive whitespace
    beautified = beautified.replace(/\s+/g, ' ').trim()
    
    // Add proper paragraph breaks for template sections
    beautified = beautified.replace(/\.\s+([A-Z])/g, '.\n\n$1')
    
    // Add line breaks after colons (for field definitions)
    beautified = beautified.replace(/:\s+/g, ':\n')
    
    // Add line breaks before numbered items
    beautified = beautified.replace(/(\d+\.)\s*/g, '\n$1 ')
    
    // Clean up multiple consecutive line breaks
    beautified = beautified.replace(/\n{3,}/g, '\n\n')
    
    return beautified.trim()
  }, [])

  // Initialize content when template changes
  useEffect(() => {
    if (template) {
      const templateContent = template.content || ''
      setContent(templateContent)
      setEditingContent(templateContent)
    } else {
      setContent('')
      setEditingContent('')
    }
  }, [template?.id, template?.content])

  // Merge variables when template or variables change
  useEffect(() => {
    mergeVariables()
  }, [mergeVariables])

  // Register update function with parent
  useEffect(() => {
    if (onRegisterUpdateFunction) {
      const updateFunction = (newContent: string | null) => {
        const safeContent = newContent || ''
        setContent(safeContent)
        setEditingContent(safeContent)
      }
      onRegisterUpdateFunction(updateFunction)
    }
  }, [onRegisterUpdateFunction])

  // Robust text position finder for template risk highlighting - matches contract editor robustness
  const findSimpleTextPosition = useCallback((text: string, clause: string): TextPosition => {
    if (!text || !clause) {
      return { start: 0, end: 0 }
    }
    
    // Clean and normalize both texts for better matching
    const normalizeText = (str: string) => str.replace(/\s+/g, ' ').trim()
    const normalizedClause = normalizeText(clause)
    
    // Strategy 1: Try exact match first (fastest)
    const exactIndex = text.indexOf(clause)
    if (exactIndex !== -1) {
      return { start: exactIndex, end: exactIndex + clause.length }
    }
    
    // Strategy 2: Try case-insensitive match
    const lowerText = text.toLowerCase()
    const lowerClause = clause.toLowerCase()
    const caseIndex = lowerText.indexOf(lowerClause)
    if (caseIndex !== -1) {
      return { start: caseIndex, end: caseIndex + clause.length }
    }
    
    // Strategy 3: Try normalized whitespace matching
    const normalizedText = normalizeText(text)
    const normalizedLowerText = normalizedText.toLowerCase()
    const normalizedLowerClause = normalizedClause.toLowerCase()
    
    const normalizedIndex = normalizedLowerText.indexOf(normalizedLowerClause)
    if (normalizedIndex !== -1) {
      // Map back to original text positions
      let originalPosition = 0
      let normalizedPosition = 0
      
      // Find the original position by walking through the text
      for (let i = 0; i < text.length && normalizedPosition < normalizedIndex; i++) {
        if (text[i].match(/\s/)) {
          // Skip multiple consecutive spaces in normalized version
          if (i === 0 || !text[i-1].match(/\s/)) {
            normalizedPosition++
          }
        } else {
          normalizedPosition++
        }
        originalPosition = i + 1
      }
      
      return { start: originalPosition, end: originalPosition + clause.length }
    }
    
    // Strategy 4: Try partial matching for significant substrings
    if (clause.length > 20) {
      // Try the first and last significant parts
      const firstPart = clause.substring(0, Math.floor(clause.length / 2)).trim()
      const lastPart = clause.substring(Math.floor(clause.length / 2)).trim()
      
      if (firstPart.length > 10) {
        const firstIndex = lowerText.indexOf(firstPart.toLowerCase())
        if (firstIndex !== -1) {
          // Found first part, try to extend to find full match
          const potentialEnd = Math.min(text.length, firstIndex + clause.length + 50)
          const extendedText = text.substring(firstIndex, potentialEnd)
          
          // Check if this extended text contains most of our clause
          const wordsInClause = clause.split(/\s+/).filter(w => w.length > 3)
          const wordsInExtended = extendedText.split(/\s+/).filter(w => w.length > 3)
          const matchingWords = wordsInClause.filter(word => 
            wordsInExtended.some(extWord => extWord.toLowerCase().includes(word.toLowerCase()))
          )
          
          if (matchingWords.length >= wordsInClause.length * 0.7) {
            return { start: firstIndex, end: Math.min(firstIndex + clause.length, potentialEnd) }
          }
        }
      }
    }
    
    // Strategy 5: Find best matching sentence/paragraph
    const clauseWords = clause.split(/\s+/).filter(w => w.length > 3)
    if (clauseWords.length >= 3) {
      const sentences = text.split(/[.!?]+/)
      let bestMatch = { start: 0, end: clause.length, score: 0 }
      
      sentences.forEach(sentence => {
        const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 3)
        const matchingWords = clauseWords.filter(word => 
          sentenceWords.some(sentWord => sentWord.toLowerCase().includes(word.toLowerCase()))
        )
        
        const score = matchingWords.length / clauseWords.length
        if (score > bestMatch.score && score >= 0.5) {
          const sentenceIndex = text.indexOf(sentence)
          if (sentenceIndex !== -1) {
            bestMatch = {
              start: sentenceIndex,
              end: sentenceIndex + sentence.length,
              score: score
            }
          }
        }
      })
      
      if (bestMatch.score >= 0.5) {
        return { start: bestMatch.start, end: bestMatch.end }
      }
    }
    
    // Strategy 6: Try finding the clause in smaller chunks (for template-specific text)
    const templateWords = clause.split(/\s+/).filter(w => w.length > 2)
    if (templateWords.length >= 2) {
      // Find the most distinctive phrase (longest words)
      const distinctivePhrase = templateWords
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .join(' ')
      
      const distinctiveIndex = lowerText.indexOf(distinctivePhrase.toLowerCase())
      if (distinctiveIndex !== -1) {
        const approximateStart = Math.max(0, distinctiveIndex - 50)
        const approximateEnd = Math.min(text.length, distinctiveIndex + clause.length + 50)
        console.log(`📍 Template fallback: Found distinctive phrase "${distinctivePhrase}" at position ${distinctiveIndex}`)
        return { start: approximateStart, end: approximateEnd }
      }
    }
    
    // Strategy 7: Last resort - find any significant word from the clause
    const significantWords = templateWords.filter(w => w.length > 4)
    if (significantWords.length > 0) {
      const firstSignificantWord = significantWords[0]
      const wordIndex = lowerText.indexOf(firstSignificantWord.toLowerCase())
      if (wordIndex !== -1) {
        console.log(`📍 Template last resort: Found significant word "${firstSignificantWord}" at position ${wordIndex}`)
        return { start: wordIndex, end: Math.min(wordIndex + clause.length, text.length) }
      }
    }
    
    // If no match found, return position at start (graceful degradation)
    console.warn(`❌ Template highlighting: No match found for clause: "${clause.substring(0, 50)}..."`)
    return { start: 0, end: Math.min(clause.length, text.length) }
  }, [])

  // Clear risk highlights since we're removing risk analysis
  useEffect(() => {
    setRiskHighlights([])
  }, [content])

  // Apply variable replacement to content (only in version mode)
  // Note: Template content is already normalized in the database after analysis
  const applyVariableReplacement = useCallback((normalizedContent: string) => {
    if (!isVersionMode || !versionData?.variables) {
      return normalizedContent
    }
    
    let processedContent = normalizedContent
    console.log('🔄 Starting variable replacement in version mode:', {
      variableCount: versionData.variables.length,
      contentLength: normalizedContent.length
    })
    
    // Apply variable replacements for variables that have values
    versionData.variables.forEach(variable => {
      if (variable.value && variable.value.trim()) {
        console.log('🔄 Processing variable:', variable.label, 'with value:', variable.value)
        
        // Replace standardized variable format with user input
        const standardizedVariable = `{{${variable.label.replace(/\s+/g, '_')}}}`
        const standardizedPattern = new RegExp(standardizedVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        
        const beforeReplace = processedContent
        processedContent = processedContent.replace(standardizedPattern, variable.value)
        
        if (beforeReplace !== processedContent) {
          console.log('✅ Successfully replaced standardized variable:', standardizedVariable, '→', variable.value)
        } else {
          console.warn('⚠️ No replacement made for:', standardizedVariable)
        }
      }
    })
    
    console.log('🔄 Variable replacement completed:', {
      originalLength: normalizedContent.length,
      processedLength: processedContent.length,
      hasChanges: processedContent !== normalizedContent,
      variablesReplaced: versionData.variables.filter(v => v.value?.trim()).length
    })
    
    return processedContent
  }, [isVersionMode, versionData])

  // Get formatted content for display with variable processing
  const getFormattedContent = useCallback(() => {
    const baseContent = beautifyContent(content)
    
    // Content is already normalized in database after analysis
    // In version mode, apply user input replacements to standardized variables
    const finalContent = applyVariableReplacement(baseContent)
    
    if (isVersionMode) {
      console.log('🎯 Version mode content processing:', {
        baseContent: baseContent.substring(0, 100) + '...',
        finalContent: finalContent.substring(0, 100) + '...',
        hasReplacements: finalContent !== baseContent,
        variablesReplaced: versionData?.variables.filter(v => v.value?.trim()).length || 0
      })
    }
    
    return finalContent
  }, [content, beautifyContent, applyVariableReplacement, isVersionMode, versionData])

  // Function to render content with risk highlights
  const renderHighlightedContent = useCallback(() => {
    if (!content) {
      console.log('📄 No template content to render')
      return ''
    }
    
    const displayContent = getFormattedContent()
    
    console.log('🎨 Rendering template content:', { 
      contentLength: displayContent.length, 
      isEditing
    })
    
    // Always render plain content since we removed risk highlighting
    console.log('📄 Rendering plain template content')
    return displayContent.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < displayContent.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }, [content, getFormattedContent])


  // Handle variable creation from selected text
  const handleCreateVariableFromSelection = useCallback((selectedText: string, position: { start: number; end: number }) => {
    if (!selectedText.trim()) return
    
    // Check if global variable creation function is available from analysis component
    if (typeof window !== 'undefined' && (window as any).addTemplateVariable) {
      (window as any).addTemplateVariable(selectedText, position)
      
      // Replace selected text with variable placeholder
      const variableId = `var-${Date.now()}`
      const placeholder = `{{${selectedText.substring(0, 20).replace(/\s+/g, '_').toUpperCase()}}}`
      
      // Update content with variable placeholder
      const beforeText = content.substring(0, position.start)
      const afterText = content.substring(position.end)
      const newContent = beforeText + placeholder + afterText
      
      setContent(newContent)
      setEditingContent(newContent)
      onContentChange(newContent)
      
      // Clear selection
      setShowToolbar(false)
      setTextSelection(null)
      window.getSelection()?.removeAllRanges()
    }
  }, [content, onContentChange])

  // Listen for variable mode changes from analysis component
  useEffect(() => {
    const handleVariableModeChange = (event: CustomEvent) => {
      const { enabled } = event.detail
      setVariableSelectionEnabled(enabled)
      console.log('Variable selection mode changed:', enabled)
      
      if (enabled) {
        setShowToolbar(false)
        setTextSelection(null)
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('templateVariableModeChange', handleVariableModeChange as EventListener)
      
      return () => {
        window.removeEventListener('templateVariableModeChange', handleVariableModeChange as EventListener)
      }
    }
  }, [])

  // Handle text selection in the viewer
  const handleTextSelection = useCallback(() => {
    if (isEditing && !variableSelectionEnabled) return // Don't handle selection in edit mode unless variable mode is on
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    const selectedText = selection.toString().trim()
    console.log('Template text selection detected:', selectedText, 'Variable mode:', variableSelectionEnabled)
    
    if (selectedText.length === 0) {
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    // Check if selection is within our content area
    const range = selection.getRangeAt(0)
    const isWithinContent = contentRef.current?.contains(range.commonAncestorContainer)
    
    if (!isWithinContent) {
      console.log('Selection not within template content area')
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    // If in variable selection mode, handle variable creation immediately
    if (variableSelectionEnabled) {
      // Calculate text position for variable creation
      const contentElement = contentRef.current
      if (contentElement) {
        const contentText = contentElement.textContent || ''
        const startOffset = range.startOffset
        const endOffset = range.endOffset
        
        handleCreateVariableFromSelection(selectedText, { start: startOffset, end: endOffset })
        
        // Clear selection after variable creation
        selection.removeAllRanges()
        return
      }
    }

    const rect = range.getBoundingClientRect()
    
    // Calculate toolbar position
    const position = {
      x: Math.max(10, rect.left + (rect.width / 2) - 150),
      y: Math.max(10, rect.top + window.scrollY - 80)
    }

    console.log('Setting template toolbar visible with position:', position)

    setTextSelection({
      text: selectedText,
      position,
      range
    })
    setShowToolbar(true)
  }, [isEditing, variableSelectionEnabled, handleCreateVariableFromSelection])

  // Add event listeners for text selection
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      console.log('Template editor mouse up detected')
      setTimeout(handleTextSelection, 50)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.shiftKey || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        setTimeout(handleTextSelection, 50)
      }
    }

    console.log('Setting up template editor event listeners, isEditing:', isEditing, 'variableMode:', variableSelectionEnabled)

    // Enable selection in both view mode and when variable selection is enabled in edit mode
    if (!isEditing || variableSelectionEnabled) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('keyup', handleKeyUp)
      
      return () => {
        console.log('Cleaning up template editor event listeners')
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [handleTextSelection, isEditing, variableSelectionEnabled])

  // Close toolbar when switching to edit mode
  useEffect(() => {
    if (isEditing) {
      setShowToolbar(false)
      setTextSelection(null)
    }
  }, [isEditing])

  // Handle toolbar actions for template
  const handleExplainAction = useCallback(async (text: string) => {
    if (!template?.content) {
      return Promise.reject(new Error('No template content available'))
    }
    
    try {
      const response = await fetch('/api/template/text-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain',
          templateContent: template.content,
          selectedText: text
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.explanation) {
        throw new Error('No explanation received from AI')
      }
      
      return data.explanation
    } catch (error) {
      console.error('Template text explanation failed:', error)
      throw error
    }
  }, [template])

  const handleRedraftAction = useCallback(async (text: string, instructions?: string) => {
    if (!template?.content) {
      return Promise.reject(new Error('No template content available'))
    }
    
    try {
      const response = await fetch('/api/template/text-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redraft',
          templateContent: template.content,
          selectedText: text,
          instructions: instructions || 'Improve this text for better template flexibility'
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.redraftedText) {
        throw new Error('No redrafted text received from AI')
      }
      
      // Return structured data for the toolbar to handle
      return {
        originalText: text,
        redraftedText: data.redraftedText,
        explanation: data.explanation || 'The text has been improved for template flexibility and clarity.',
        onAccept: async () => {
          // Replace the selected text in the content
          const newContent = content.replace(text, data.redraftedText)
          console.log('🔄 Template redraft accepted, updating content:', { 
            oldLength: content.length, 
            newLength: newContent.length,
            originalText: text.substring(0, 50) + '...',
            redraftedText: data.redraftedText.substring(0, 50) + '...'
          })
          
          // Update content immediately
          setContent(newContent)
          setEditingContent(newContent)
          onContentChange(newContent)
          
          // Close toolbar and clear selection
          setShowToolbar(false)
          setTextSelection(null)
          
          // If risks were being shown, trigger reanalysis
          if (onReanalyzeRisks) {
            console.log('🔄 Triggering template reanalysis after redraft...')
            setTimeout(async () => {
              try {
                await onReanalyzeRisks()
                console.log('✅ Template reanalysis completed')
              } catch (error) {
                console.error('❌ Template reanalysis failed:', error)
              }
            }, 500)
          }
        },
        onReject: () => {
          console.log('❌ Template redraft rejected')
          // Just close the toolbar
          setShowToolbar(false)
          setTextSelection(null)
        }
      }
    } catch (error) {
      console.error('Template text redraft failed:', error)
      throw error
    }
  }, [template, content, onContentChange, onReanalyzeRisks])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false)
      }
    }

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDownloadDropdown])

  // Handle editing content change
  const handleEditingContentChange = (newEditingContent: string) => {
    setEditingContent(newEditingContent)
    setContent(newEditingContent)
    debouncedSave(newEditingContent)
  }

  // Debounced save function
  const debouncedSave = useCallback((newContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      console.log('💾 Auto-saving template after 2 seconds of no typing...')
      onContentChange(newContent)
      saveTimeoutRef.current = null
    }, 2000)
  }, [onContentChange])

  // Force save when switching modes
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      console.log('💾 Force saving template...')
      onContentChange(content)
      saveTimeoutRef.current = null
    }
  }, [content, onContentChange])

  // Save/restore scroll position
  const saveScrollPosition = useCallback(() => {
    const scrollContainer = contentRef.current?.parentElement || editorRef.current?.parentElement
    if (scrollContainer) {
      const currentScroll = scrollContainer.scrollTop
      setScrollPosition(currentScroll)
      console.log('📍 Saved template scroll position:', currentScroll)
    }
  }, [])

  const restoreScrollPosition = useCallback(() => {
    setTimeout(() => {
      const scrollContainer = contentRef.current?.parentElement || editorRef.current?.parentElement
      if (scrollContainer && scrollPosition > 0) {
        scrollContainer.scrollTop = scrollPosition
        console.log('🎯 Restored template scroll position:', scrollPosition)
      }
    }, 200)
  }, [scrollPosition])

  // Toggle between view and edit modes
  const toggleEditMode = useCallback(() => {
    if (isEditing) {
      // User clicked "Done Editing"
      forceSave()
      saveScrollPosition()
      setContent(editingContent)
      setIsEditing(false)
      
      // Notify parent component about edit mode change
      if (onEditModeChange) {
        onEditModeChange(false)
      }
      
      // Trigger reanalysis if function available
      if (onReanalyzeRisks) {
        console.log('🔄 Triggering template reanalysis after editing...')
        setTimeout(async () => {
          try {
            await onReanalyzeRisks()
            console.log('✅ Template reanalysis completed successfully')
          } catch (error) {
            console.error('❌ Template reanalysis failed:', error)
          }
        }, 500)
      }
      
      setTimeout(() => {
        restoreScrollPosition()
      }, 500)
    } else {
      // User clicked "Edit Template"
      saveScrollPosition()
      setEditingContent(beautifyContent(content))
      setIsEditing(true)
      
      // Notify parent component about edit mode change
      if (onEditModeChange) {
        onEditModeChange(true)
      }
      
      setTimeout(() => {
        editorRef.current?.focus()
        restoreScrollPosition()
      }, 150)
    }
  }, [isEditing, forceSave, saveScrollPosition, restoreScrollPosition, content, beautifyContent, editingContent, onReanalyzeRisks, onEditModeChange])

  // Handle download actions
  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!template || !content) return
    
    const formattedContent = getFormattedContent()
    const title = template.title || 'Template'
    
    setShowDownloadDropdown(false)
    
    if (format === 'docx') {
      await downloadTemplateDocx(formattedContent, title)
    } else {
      await downloadTemplatePdf(formattedContent, title)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Handle cursor position tracking
  const trackCursorPosition = useCallback(() => {
    if (editorRef.current) {
      setCursorPosition(editorRef.current.selectionStart)
    }
  }, [])

  // Insert variable at cursor position
  const insertVariableAtCursor = useCallback((variableLabel: string) => {
    if (!editorRef.current) return

    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const variablePattern = `{{${variableLabel.replace(/\s+/g, '_')}}}`

    // Store current scroll position
    const currentScrollTop = textarea.scrollTop

    // Insert the variable
    const newText = text.substring(0, start) + variablePattern + text.substring(end)
    setEditingContent(newText)
    setContent(newText)

    // Update cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + variablePattern.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      
      // Restore scroll position to prevent auto-scrolling to bottom
      textarea.scrollTop = currentScrollTop
    }, 0)

    // Close dropdown
    setShowVariableDropdown(false)
    setVariableSearch('')
  }, [])

  // Create new variable
  const handleCreateVariable = useCallback(async () => {
    if (!newVariableForm.label.trim() || !template) return

    const newVariable: UserCreatedVariable = {
      id: `custom-var-${Date.now()}`,
      label: newVariableForm.label.trim(),
      fieldType: newVariableForm.fieldType,
      description: newVariableForm.description.trim(),
      createdAt: new Date().toISOString(),
      isUserCreated: true
    }

    // Update template with new variable
    const updatedVariables = [...(template.user_created_variables || []), newVariable]
    
    try {
      const response = await fetch(`/api/template/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_created_variables: updatedVariables
        })
      })

      if (response.ok) {
        // Update local state
        template.user_created_variables = updatedVariables
        mergeVariables()
        
        // Insert the variable at cursor
        insertVariableAtCursor(newVariable.label)
        
        // Reset form and close modal
        setNewVariableForm({ label: '', description: '', fieldType: 'text' })
        setShowCreateVariableModal(false)
        
        // Notify parent component to refresh variables
        if (window.refreshTemplateVariables) {
          window.refreshTemplateVariables()
        }
      }
    } catch (error) {
      console.error('Error creating variable:', error)
    }
  }, [newVariableForm, template, mergeVariables, insertVariableAtCursor])

  // Delete variable
  const handleDeleteVariable = useCallback(async (variableId: string) => {
    if (!template) return

    const updatedVariables = template.user_created_variables.filter(v => v.id !== variableId)
    
    try {
      const response = await fetch(`/api/template/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_created_variables: updatedVariables
        })
      })

      if (response.ok) {
        template.user_created_variables = updatedVariables
        mergeVariables()
      }
    } catch (error) {
      console.error('Error deleting variable:', error)
    }
  }, [template, mergeVariables])

  // Rename variable
  const handleRenameVariable = useCallback(async () => {
    if (!template || !variableToRename || !renameVariableForm.label.trim()) return

    const variable = allVariables.find(v => v.id === variableToRename)
    if (!variable || !variable.isUserCreated) return

    const oldVariablePattern = `{{${variable.label.replace(/\s+/g, '_')}}}`
    const newVariablePattern = `{{${renameVariableForm.label.trim().replace(/\s+/g, '_')}}}`

    // Update all occurrences in content
    const updatedContent = editingContent.replace(
      new RegExp(oldVariablePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      newVariablePattern
    )

    // Update variable in database
    const updatedVariables = template.user_created_variables.map(v => 
      v.id === variableToRename 
        ? { ...v, label: renameVariableForm.label.trim(), description: renameVariableForm.description || v.description }
        : v
    )

    try {
      const response = await fetch(`/api/template/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_created_variables: updatedVariables,
          content: updatedContent
        })
      })

      if (response.ok) {
        template.user_created_variables = updatedVariables
        setEditingContent(updatedContent)
        setContent(updatedContent)
        mergeVariables()
        
        // Close modal and reset
        setShowRenameVariableModal(false)
        setVariableToRename(null)
        setRenameVariableForm({ label: '', description: '' })
      }
    } catch (error) {
      console.error('Error renaming variable:', error)
    }
  }, [template, variableToRename, renameVariableForm, editingContent, allVariables, mergeVariables])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variableDropdownRef.current && !variableDropdownRef.current.contains(event.target as Node)) {
        setShowVariableDropdown(false)
      }
    }

    if (showVariableDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVariableDropdown])

  if (!template) {
    return (
      <div className={styles.noTemplate}>
        <p>Select a template to view</p>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Toggle between view and edit modes */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Only show edit button when NOT in version mode */}
          {!isVersionMode && (
            <button 
              className={`${styles.modeToggle} ${isEditing ? styles.editing : styles.viewing}`}
              onClick={toggleEditMode}
            >
              {isEditing ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Done Editing
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Template
                </>
              )}
            </button>
          )}

          {/* Insert Variable button - only show in edit mode */}
          {isEditing && !isVersionMode && (
            <div className={styles.variableContainer} ref={variableDropdownRef}>
              <button
                className={styles.insertVariableButton}
                onClick={() => setShowVariableDropdown(!showVariableDropdown)}
                title="Insert a template variable"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="9" y1="15" x2="11" y2="15"/>
                </svg>
                Insert Variable
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showVariableDropdown && (
                <div className={styles.variableDropdown}>
                  <div className={styles.variableDropdownHeader}>
                    <input
                      type="text"
                      placeholder="Search variables..."
                      value={variableSearch}
                      onChange={(e) => setVariableSearch(e.target.value)}
                      className={styles.variableSearchInput}
                      autoFocus
                    />
                  </div>

                  <div className={styles.variableDropdownActions}>
                    <button
                      className={styles.createVariableButton}
                      onClick={() => {
                        setShowVariableDropdown(false)
                        setShowCreateVariableModal(true)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v8m-4-4h8"/>
                      </svg>
                      Create New Variable
                    </button>
                  </div>

                  <div className={styles.variableList}>
                    {allVariables
                      .filter(v => v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .map(variable => (
                        <div
                          key={variable.id}
                          className={styles.variableItem}
                        >
                          <div 
                            className={styles.variableInfo}
                            onClick={() => insertVariableAtCursor(variable.label)}
                          >
                            <div className={styles.variableLabel}>
                              <span className={styles.variableName}>{variable.label}</span>
                              {variable.isUserCreated && (
                                <span className={styles.userCreatedBadge}>User</span>
                              )}
                            </div>
                            <div className={styles.variableDetails}>
                              <span className={styles.variableType}>{variable.fieldType}</span>
                              <span className={styles.variableOccurrences}>
                                {variable.occurrences} occurrence{variable.occurrences !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {variable.description && (
                              <div className={styles.variableDescription}>{variable.description}</div>
                            )}
                          </div>
                          {variable.isUserCreated && (
                            <div className={styles.variableActions}>
                              <button
                                className={styles.variableActionButton}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setVariableToRename(variable.id)
                                  setRenameVariableForm({ 
                                    label: variable.label, 
                                    description: variable.description || '' 
                                  })
                                  setShowRenameVariableModal(true)
                                  setShowVariableDropdown(false)
                                }}
                                title="Rename variable"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                className={styles.variableActionButton}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`Delete variable "${variable.label}"?`)) {
                                    handleDeleteVariable(variable.id)
                                  }
                                }}
                                title="Delete variable"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    {allVariables.filter(v => v.label.toLowerCase().includes(variableSearch.toLowerCase())).length === 0 && (
                      <div className={styles.noVariables}>
                        No variables found. Create a new one!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Version Mode Actions - only show when in version mode */}
          {isVersionMode && (
            <>
              <div className={styles.versionIndicator}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                {versionData?.versionName || 'Template Version'}
              </div>
              <button 
                className={styles.backButton}
                onClick={onBackToOriginal}
                title="Return to original template"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5"/>
                  <polyline points="12,19 5,12 12,5"/>
                </svg>
                Back to Original
              </button>
              
              <div className={styles.downloadContainer} ref={downloadRef}>
                <button 
                  className={styles.downloadButton}
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  disabled={!content.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                  Download Version
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {showDownloadDropdown && (
                  <div className={styles.downloadDropdown}>
                    <button 
                      className={styles.downloadOption}
                      onClick={() => handleDownload('docx')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="21"/>
                        <line x1="8" y1="13" x2="16" y2="21"/>
                      </svg>
                      Download as DOCX
                    </button>
                    <button 
                      className={styles.downloadOption}
                      onClick={() => handleDownload('pdf')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                        <line x1="12" y1="12" x2="12" y2="18"/>
                      </svg>
                      Download as PDF
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {!isEditing && (
          <div className={styles.riskInfo}>
            {isVersionMode ? (
              <span className={styles.selectionHint} style={{ color: '#059669', fontWeight: '600' }}>
                ✅ Version Mode: Viewing template with your variable inputs applied
              </span>
            ) : (
              <span className={styles.selectionHint}>
                {variableSelectionEnabled 
                  ? 'Variable mode: Select text to create template variables'
                  : 'Select any text to explain or improve with AI'
                }
              </span>
            )}
            {showToolbar && (
              <span className={styles.toolbarStatus}>
                ✓ Toolbar active
              </span>
            )}
            {variableSelectionEnabled && (
              <span className={styles.toolbarStatus} style={{ color: '#10b981', fontWeight: '600' }}>
                ✓ Variable creation mode active
              </span>
            )}
          </div>
        )}
        
        {isEditing && (
          <div className={styles.riskInfo}>
            <span className={styles.riskCount}>
              {variableSelectionEnabled 
                ? 'Edit mode + Variable creation active'
                : 'Editing mode - formatted content preserved'
              }
            </span>
            <span className={styles.selectionHint}>
              {variableSelectionEnabled 
                ? 'Select text in the template below to create variables'
                : 'Click "Done Editing" to save changes'
              }
            </span>
            {variableSelectionEnabled && (
              <span className={styles.toolbarStatus} style={{ color: '#10b981', fontWeight: '600' }}>
                ✓ Variable creation mode active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {isEditing ? (
          // Edit mode
          <textarea
            ref={editorRef}
            value={editingContent}
            onChange={(e) => handleEditingContentChange(e.target.value)}
            onKeyUp={trackCursorPosition}
            onClick={trackCursorPosition}
            className={styles.editor}
            placeholder="Enter template content..."
            style={{
              fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              padding: '32px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              color: '#1f2937'
            }}
          />
        ) : (
          // View mode with risk highlighting
          <div 
            ref={contentRef}
            className={styles.viewer}
            data-template-editor="true"
          >
            <div className={styles.highlightedContent}>
              {content ? renderHighlightedContent() : (
                <div className={styles.emptyState}>
                  <p>This template is empty. Click "Edit Template" to add content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selection Toolbar */}
      <SelectionToolbar
        selectedText={textSelection?.text || ''}
        position={textSelection?.position || { x: 0, y: 0 }}
        onExplain={handleExplainAction}
        onRedraft={handleRedraftAction}
        onClose={() => {
          console.log('Template toolbar onClose called - closing toolbar')
          setShowToolbar(false)
          setTextSelection(null)
        }}
        isVisible={!!(textSelection && showToolbar)}
      />

      {/* Create Variable Modal */}
      {showCreateVariableModal && (
        <div className={styles.modal} onClick={() => setShowCreateVariableModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create New Variable</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowCreateVariableModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Variable Name *</label>
                <input
                  type="text"
                  value={newVariableForm.label}
                  onChange={(e) => setNewVariableForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Company Name"
                  className={styles.formInput}
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={newVariableForm.description}
                  onChange={(e) => setNewVariableForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this variable"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Variable Type</label>
                <select
                  value={newVariableForm.fieldType}
                  onChange={(e) => setNewVariableForm(prev => ({ 
                    ...prev, 
                    fieldType: e.target.value as 'text' | 'email' | 'number' | 'date' 
                  }))}
                  className={styles.formSelect}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </div>

              <div className={styles.previewSection}>
                <label>Preview</label>
                <div className={styles.variablePreview}>
                  {newVariableForm.label ? `{{${newVariableForm.label.replace(/\s+/g, '_')}}}` : '{{Variable_Name}}'}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCreateVariableModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleCreateVariable}
                disabled={!newVariableForm.label.trim()}
              >
                Create & Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Variable Modal */}
      {showRenameVariableModal && (
        <div className={styles.modal} onClick={() => setShowRenameVariableModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Rename Variable</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowRenameVariableModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Variable Name *</label>
                <input
                  type="text"
                  value={renameVariableForm.label}
                  onChange={(e) => setRenameVariableForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Company Name"
                  className={styles.formInput}
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={renameVariableForm.description}
                  onChange={(e) => setRenameVariableForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this variable"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.previewSection}>
                <label>Preview</label>
                <div className={styles.variablePreview}>
                  {renameVariableForm.label ? `{{${renameVariableForm.label.replace(/\s+/g, '_')}}}` : '{{Variable_Name}}'}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowRenameVariableModal(false)
                  setVariableToRename(null)
                }}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleRenameVariable}
                disabled={!renameVariableForm.label.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

