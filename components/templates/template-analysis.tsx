'use client'

import { useState, useEffect, useCallback } from 'react'
import { Template } from '@/lib/supabase-client'
import { Button } from '@/components/ui'
import TemplateVersionList from './template-version-list'
import styles from './template-analysis.module.css'

interface TemplateAnalysisProps {
  template: Template
  risks: any[]
  onRisksUpdate: (risks: any[]) => void
  onTemplateUpdate: (template: Template) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function TemplateAnalysis({
  template,
  risks,
  onRisksUpdate,
  onTemplateUpdate,
  onToast
}: TemplateAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'risks'>('summary')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Handle analysis triggering
  const handleAnalyzeTemplate = async () => {
    if (!template?.id) return

    try {
      setAnalyzing(true)
      setAnalysisProgress(0)
      onToast('Starting template analysis...', 'info')

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
        onToast('Template analysis completed successfully!', 'success')
        // Update template with new analysis results
        const updatedTemplate = { ...template, analysis_status: 'complete', analysis_progress: 100 }
        onTemplateUpdate(updatedTemplate)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Template analysis error:', error)
      onToast('Template analysis failed. Please try again.', 'error')
    } finally {
      setAnalyzing(false)
      setAnalysisProgress(0)
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
          <Button
            onClick={handleAnalyzeTemplate}
            disabled={analyzing}
            variant="primary"
            size="sm"
          >
            {analyzing ? `Analyzing... ${analysisProgress}%` : 'Analyze Template'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'risks' ? styles.active : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          Risk Analysis ({risks.length})
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
                
                {/* Template Version Information - Integrated into Summary */}
                <div className={styles.summarySection}>
                  <h4>Version Management</h4>
                  <TemplateVersionList
                    templateId={template.id}
                    onToast={onToast}
                    onTemplateRestore={() => {
                      // Trigger a refresh of the template data
                      if (onTemplateUpdate) {
                        // Force a re-fetch of the template to get updated content
                        window.location.reload()
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No analysis available. Click "Analyze Template" to begin.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className={styles.risks}>
            <div className={styles.riskAnalysisHeader}>
              <h3 className={styles.riskAnalysisTitle}>Template Risk Analysis</h3>
              
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minHeight: '250px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                <p>No active risks found. {hasAnalysis ? 'All risks have been resolved.' : 'Run analysis to identify potential template risks.'}</p>
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
    </div>
  )
}