'use client'

import { useState } from 'react'
import { Contract } from '@/lib/types'
import { Button, Input, Card, Skeleton } from '@/components/ui'
import { UploadButton } from '@/lib/uploadthing'
import { contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import { ContractCreatorDialog } from './contract-creator-dialog'
import mammoth from 'mammoth'
import styles from './contract-list.module.css'

interface ContractListProps {
  contracts: Contract[]
  selectedContract: Contract | null
  onSelectContract: (contract: Contract) => void
  onContractsUpdate: () => void
}

export default function ContractList({
  contracts,
  selectedContract,
  onSelectContract,
  onContractsUpdate
}: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showCreatorDialog, setShowCreatorDialog] = useState(false)

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function extractTextFromDocx(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('Error extracting text:', error)
      throw error
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Read file as ArrayBuffer and extract text
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      const extractedText = result.value
      
      // Extract title from filename
      const title = file.name.replace('.docx', '')
      
      // Get current user
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')
      
      // Save to database
      const newContract = await contractsApi.create({
        user_id: user.id,
        title,
        content: extractedText,
        upload_url: null, // No URL since we're handling file directly
        file_key: null,   // No key since we're not using uploadthing
        analysis_cache: {}
      })
      
      // Trigger automatic analysis
      try {
        const analysisResponse = await fetch('/api/contract/auto-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: newContract.id })
        })
        
        if (!analysisResponse.ok) {
          console.warn('Analysis start failed, but contract uploaded successfully')
        }
      } catch (analysisError) {
        console.error('Analysis trigger failed:', analysisError)
      }
      
      onContractsUpdate()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to process contract')
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  async function handleUploadComplete(res: any) {
    if (res?.[0]) {
      try {
        setUploading(true)
        const file = res[0]
        const extractedText = await extractTextFromDocx(file.url)
        
        // Extract title from filename
        const title = file.name.replace('.docx', '')
        
        // Get current user
        const user = await getCurrentUser()
        if (!user) throw new Error('User not authenticated')
        
        // Save to database
        const newContract = await contractsApi.create({
          user_id: user.id,
          title,
          content: extractedText,
          upload_url: file.url,
          file_key: file.key,
          analysis_cache: {}
        })
        
        // Trigger automatic analysis
        try {
          const analysisResponse = await fetch('/api/contract/auto-analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractId: newContract.id })
          })
          
          if (!analysisResponse.ok) {
            console.warn('Analysis start failed, but contract uploaded successfully')
          }
        } catch (analysisError) {
          console.error('Analysis trigger failed:', analysisError)
        }
        
        onContractsUpdate()
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to process contract')
      } finally {
        setUploading(false)
      }
    }
  }

  const handleContractCreated = async (contractId: string) => {
    // Refresh contracts list and select the new contract
    onContractsUpdate()
    setShowCreatorDialog(false)
    
    // Find and select the newly created contract
    setTimeout(() => {
      const newContract = contracts.find(c => c.id === contractId)
      if (newContract) {
        onSelectContract(newContract)
      }
    }, 500)
  }

  return (
    <div className={styles.container}>
      {/* Fixed Logo at Top */}
      <div className={styles.logoContainer}>
        <img src="/logo.png" alt="Contract Manager" className={styles.logo} />
      </div>
      
      {/* Fixed Search and Upload Section */}
      <div className={styles.searchUploadSection}>
        {/* Search Bar */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <Input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        
        {/* Action Buttons */}
        <div className={styles.uploadSection}>
          {/* Create Contract Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreatorDialog(true)}
            className="w-full mb-2"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ marginRight: '8px' }}
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
            Create with AI
          </Button>
          
          {/* Upload Button */}
          <input
            type="file"
            id="file-upload"
            accept=".docx"
            onChange={handleFileUpload}
            className={styles.hiddenInput}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className={styles.uploadButton}>
            {uploading ? 'Processing...' : 'Upload Contract (.docx)'}
          </label>
        </div>
      </div>

      {/* Scrollable Contract List */}
      <div className={styles.contractsListContainer}>
        {filteredContracts.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p className="text-sm text-secondary">
              {searchTerm ? 'No contracts found' : 'No contracts yet'}
            </p>
            {!searchTerm && (
              <p className="text-xs text-secondary" style={{ marginTop: '8px' }}>
                Upload your first contract to get started
              </p>
            )}
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => onSelectContract(contract)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                background: selectedContract?.id === contract.id ? 'var(--color-bg-secondary)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                marginBottom: '4px',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (selectedContract?.id !== contract.id) {
                  e.currentTarget.style.backgroundColor = 'var(--color-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedContract?.id !== contract.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-text-secondary)' }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="font-medium text-sm" style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {contract.title}
                  </h3>
                  <p className="text-xs text-secondary" style={{ marginTop: '2px' }}>
                    {new Date(contract.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Contract Creator Dialog */}
      <ContractCreatorDialog
        isOpen={showCreatorDialog}
        onClose={() => setShowCreatorDialog(false)}
        onContractCreated={handleContractCreated}
      />
    </div>
  )
}