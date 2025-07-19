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
  const [activeTab, setActiveTab] = useState<'summary' | 'risks' | 'versions'>('summary')
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

  // Handle risk resolution (new feature for templates)
  const handleResolveRisk = async (riskId: string) => {
    try {
      // Find the risk to resolve
      const riskToResolve = risks.find(risk => risk.id === riskId)
      if (!riskToResolve) return

      // Add to resolved risks
      const currentResolvedRisks = template.resolved_risks || []
      const updatedResolvedRisks = [...currentResolvedRisks, { ...riskToResolve, resolvedAt: new Date().toISOString() }]

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

      if (!response.ok) throw new Error('Failed to resolve risk')

      const updatedTemplate = await response.json()
      onTemplateUpdate(updatedTemplate)

      // Update risks display (remove resolved risk)
      const updatedRisks = risks.filter(risk => risk.id !== riskId)
      onRisksUpdate(updatedRisks)

      onToast('Risk marked as resolved', 'success')
    } catch (error) {
      console.error('Error resolving risk:', error)
      onToast('Failed to resolve risk', 'error')
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
        <button
          className={`${styles.tab} ${activeTab === 'versions' ? styles.active : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Version Control
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

        {activeTab === 'risks' && (
          <div className={styles.risksTab}>
            {risks.length > 0 ? (
              <div className={styles.risksList}>
                {risks.map((risk) => (
                  <div key={risk.id} className={styles.riskCard}>
                    <div className={styles.riskHeader}>
                      <span className={`${styles.riskBadge} ${styles[risk.riskLevel]}`}>
                        {risk.riskLevel.toUpperCase()} RISK
                      </span>
                      <button
                        className={styles.resolveButton}
                        onClick={() => handleResolveRisk(risk.id)}
                        title="Mark as resolved"
                      >
                        ✓ Resolve
                      </button>
                    </div>
                    <h4>{risk.category}</h4>
                    <p className={styles.riskClause}>{risk.clause}</p>
                    <p className={styles.riskExplanation}>{risk.explanation}</p>
                    {risk.suggestion && (
                      <div className={styles.suggestion}>
                        <strong>Suggestion:</strong> {risk.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No active risks found. {hasAnalysis ? 'All risks have been resolved.' : 'Run analysis to identify potential risks.'}</p>
              </div>
            )}

            {/* Resolved Risks Section */}
            {template.resolved_risks && template.resolved_risks.length > 0 && (
              <div className={styles.resolvedRisksSection}>
                <h3>Resolved Risks ({template.resolved_risks.length})</h3>
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

        {activeTab === 'versions' && (
          <div className={styles.versionsTab}>
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
        )}
      </div>
    </div>
  )
}