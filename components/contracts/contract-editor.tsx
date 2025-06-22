'use client'

import { useState, useEffect } from 'react'
import { Contract } from '@/lib/types'
import { Button, Textarea } from '@/components/ui'
import { contractsApi } from '@/lib/supabase-client'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

interface ContractEditorProps {
  contract: Contract | null
  onUpdate: () => void
  onMobileViewChange?: (view: 'list' | 'editor' | 'analysis') => void
  mobileView?: 'list' | 'editor' | 'analysis'
}

export default function ContractEditor({ contract, onUpdate, onMobileViewChange, mobileView }: ContractEditorProps) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (contract) {
      setContent(contract.content || '')
      setHasChanges(false)
    }
  }, [contract])

  async function handleSave() {
    if (!contract || !hasChanges) return
    
    setSaving(true)
    try {
      await contractsApi.update(contract.id, { content })
      setHasChanges(false)
      onUpdate()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    if (!contract) return

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: content.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line)]
            })
          )
        }]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${contract.title}.docx`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export document')
    }
  }

  function handleContentChange(newContent: string) {
    setContent(newContent)
    setHasChanges(newContent !== contract?.content)
  }

  if (!contract) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            style={{ margin: '0 auto', color: 'var(--color-text-secondary)', marginBottom: '16px' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p className="text-secondary">Select a contract to edit</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-white)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <h2 className="font-semibold" style={{ fontSize: '16px' }}>{contract.title}</h2>
          <p className="text-xs text-secondary" style={{ marginTop: '2px' }}>
            Last modified {new Date(contract.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mobile Toggle Buttons */}
          {onMobileViewChange && (
            <div style={{ display: 'none' }} className="mobile-toggle-buttons">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => onMobileViewChange('list')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                List
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => onMobileViewChange('analysis')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                Analysis
              </Button>
            </div>
          )}
          
          {/* Editor Actions */}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving} 
            size="sm"
            variant={hasChanges ? 'primary' : 'secondary'}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ marginRight: '6px' }} />
                Saving...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save
              </>
            )}
          </Button>
          <Button onClick={handleExport} variant="secondary" size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </Button>
        </div>
      </div>
      
      {/* Editor */}
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '600px',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.6',
            resize: 'none',
            border: 'none',
            outline: 'none',
            padding: 0
          }}
          placeholder="Contract content..."
        />
      </div>
      
      {/* Status bar */}
      {hasChanges && (
        <div style={{ 
          padding: '8px 24px', 
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          Unsaved changes
        </div>
      )}
    </div>
  )
}