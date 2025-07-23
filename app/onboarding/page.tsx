'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Label } from '@/components/ui'
import { ArrowRight, Check, Upload, Brain, FileText, Zap } from 'lucide-react'
import JurisdictionSelector from '@/components/onboarding/jurisdiction-selector'
import { jurisdictionData, getJurisdictionByKey } from '@/lib/jurisdiction-data'
import { contractsApi } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth-client'
import mammoth from 'mammoth'
import Lottie from 'lottie-react'
import styles from './onboarding.module.css'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  animationPath: string
  component: React.ComponentType<{ onNext: (contractId?: string) => void; user?: any }>
}

// Step 1: Welcome & Value Proposition
function WelcomeStep({ onNext }: { onNext: (contractId?: string) => void; user?: any }) {
  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Welcome to Contract Manager Pro
        </h1>
        <p className={styles.heroSubtitle}>
          AI-powered contract analysis that helps you understand risks, terms, and opportunities in seconds.
        </p>
      </div>

      <div className={styles.featuresSection}>
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <Brain className={styles.featureIcon} />
            <div className={styles.featureContent}>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced AI analyzes contracts for risks, key terms, and legal insights</p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <FileText className={styles.featureIcon} />
            <div className={styles.featureContent}>
              <h3>Smart Document Processing</h3>
              <p>Upload DOCX files and get immediate intelligent analysis</p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <Zap className={styles.featureIcon} />
            <div className={styles.featureContent}>
              <h3>Instant Insights</h3>
              <p>Comprehensive contract analysis in under 30 seconds</p>
            </div>
          </li>
        </ul>
      </div>

      <div className={styles.actionSection}>
        <Button onClick={onNext} size="lg">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Step 2: Profile Setup
function ProfileStep({ onNext }: { onNext: (contractId?: string) => void; user?: any }) {
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    company: '',
    useCase: ''
  })

  const roles = [
    'Legal Professional',
    'Business Owner', 
    'Procurement Manager',
    'Consultant',
    'Other'
  ]

  const useCases = [
    'Contract Review & Analysis',
    'Risk Assessment',
    'Legal Compliance',
    'Vendor Management',
    'General Business Contracts'
  ]

  const isValid = profile.name && profile.role && profile.useCase

  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Tell us about yourself
        </h1>
        <p className={styles.heroSubtitle}>
          Help us customize your experience for your specific needs.
        </p>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              type="text"
              value={profile.company}
              onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Your company name"
            />
          </div>

          <div className={styles.formGroup}>
            <Label>What's your role?</Label>
            <div className={styles.optionGrid}>
              {roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, role }))}
                  className={`${styles.optionButton} ${profile.role === role ? styles.selected : ''}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Primary use case?</Label>
            <div className={styles.optionGrid}>
              {useCases.map(useCase => (
                <button
                  key={useCase}
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, useCase }))}
                  className={`${styles.optionButton} ${profile.useCase === useCase ? styles.selected : ''}`}
                >
                  {useCase}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <Button 
          onClick={onNext}
          disabled={!isValid}
          size="lg"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Step 3: Organization & Jurisdiction Mapping
function OrganizationStep({ onNext }: { onNext: (contractId?: string) => void; user?: any }) {
  const [organization, setOrganization] = useState({
    primaryJurisdiction: [] as string[], // Array for JurisdictionSelector
    organizationType: '',
    industry: '',
    companySize: '',
    additionalJurisdictions: [] as string[],
    regulatoryRequirements: [] as string[],
    riskTolerance: 'medium',
    hasLegalCounsel: false
  })

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Professional Services',
    'Retail',
    'Real Estate',
    'Education',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ]

  const regulatoryOptions = [
    'GDPR (EU Data Protection)',
    'HIPAA (Healthcare)',
    'SOX (Financial Reporting)',
    'PCI-DSS (Payment Processing)',
    'CCPA (California Privacy)',
    'Industry-Specific Regulations'
  ]

  // Get company types based on selected primary jurisdiction - memoized to prevent infinite re-renders
  const availableCompanyTypes = useMemo(() => {
    if (organization.primaryJurisdiction.length === 0) return []
    
    const primaryJurisdictionKey = organization.primaryJurisdiction[0]
    const jurisdictionInfo = getJurisdictionByKey(primaryJurisdictionKey)
    
    if (jurisdictionInfo) {
      return jurisdictionInfo.companyTypes
    }
    
    // Fallback to generic types
    return [
      { value: 'corporation', label: 'Corporation', description: 'Standard corporate structure' },
      { value: 'llc', label: 'Limited Liability Company', description: 'Flexible business structure' },
      { value: 'partnership', label: 'Partnership', description: 'Business owned by partners' },
      { value: 'sole-proprietorship', label: 'Sole Proprietorship', description: 'Individual business ownership' }
    ]
  }, [organization.primaryJurisdiction])
  
  // Get jurisdiction name for display - memoized
  const primaryJurisdictionName = useMemo(() => {
    return organization.primaryJurisdiction.length > 0 
      ? getJurisdictionByKey(organization.primaryJurisdiction[0])?.name || ''
      : ''
  }, [organization.primaryJurisdiction])

  const isValid = organization.primaryJurisdiction.length > 0 && organization.organizationType && organization.industry && organization.companySize

  const handleRegulatoryToggle = useCallback((requirement: string) => {
    setOrganization(prev => {
      const requirements = prev.regulatoryRequirements.includes(requirement)
        ? prev.regulatoryRequirements.filter(r => r !== requirement)
        : [...prev.regulatoryRequirements, requirement]
      
      return { ...prev, regulatoryRequirements: requirements }
    })
  }, [])

  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Tell us about your organization
        </h1>
        <p className={styles.heroSubtitle}>
          This helps our legal AI team create contracts tailored to your specific business context and regulatory requirements.
        </p>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <JurisdictionSelector
              selectedJurisdictions={organization.primaryJurisdiction}
              onJurisdictionsChange={useCallback((jurisdictions: string[]) => {
                setOrganization(prev => ({ 
                  ...prev, 
                  primaryJurisdiction: jurisdictions,
                  organizationType: '' // Reset organization type when jurisdiction changes
                }))
              }, [])}
              label="Primary Jurisdiction"
              placeholder="Search for your primary jurisdiction..."
              maxSelections={1}
            />
            <p className={styles.helpText}>
              Select the jurisdiction where your company is legally registered
            </p>
          </div>

          {organization.primaryJurisdiction.length > 0 && (
            <div className={styles.formGroup}>
              <Label>Organization Type ({primaryJurisdictionName})</Label>
              <p className={styles.helpText}>
                Available company types in {primaryJurisdictionName}
              </p>
              <div className={styles.companyTypeGrid}>
                {availableCompanyTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setOrganization(prev => ({ ...prev, organizationType: type.value }))}
                    className={`${styles.companyTypeButton} ${organization.organizationType === type.value ? styles.selected : ''}`}
                  >
                    <div className={styles.companyTypeLabel}>{type.label}</div>
                    <div className={styles.companyTypeDescription}>{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <Label>Industry</Label>
            <div className={styles.optionGrid}>
              {industries.map(industry => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => setOrganization(prev => ({ ...prev, industry }))}
                  className={`${styles.optionButton} ${organization.industry === industry ? styles.selected : ''}`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Company Size</Label>
            <div className={styles.optionGrid}>
              {companySizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setOrganization(prev => ({ ...prev, companySize: size }))}
                  className={`${styles.optionButton} ${organization.companySize === size ? styles.selected : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <JurisdictionSelector
              selectedJurisdictions={organization.additionalJurisdictions}
              onJurisdictionsChange={useCallback((jurisdictions: string[]) => {
                setOrganization(prev => ({ ...prev, additionalJurisdictions: jurisdictions }))
              }, [])}
              label="Additional Jurisdictions (Optional)"
              placeholder="Search for additional jurisdictions where you operate..."
              excludeJurisdictions={organization.primaryJurisdiction}
            />
            <p className={styles.helpText}>
              Select any additional territories where you operate or have business interests
            </p>
          </div>

          <div className={styles.formGroup}>
            <Label>Regulatory Requirements (Optional)</Label>
            <div className={styles.optionGrid}>
              {regulatoryOptions.map(requirement => (
                <button
                  key={requirement}
                  type="button"
                  onClick={() => handleRegulatoryToggle(requirement)}
                  className={`${styles.optionButton} ${organization.regulatoryRequirements.includes(requirement) ? styles.selected : ''}`}
                >
                  {requirement}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Risk Tolerance</Label>
            <div className={styles.optionGrid}>
              {['Conservative', 'Moderate', 'Aggressive'].map(tolerance => (
                <button
                  key={tolerance}
                  type="button"
                  onClick={() => setOrganization(prev => ({ ...prev, riskTolerance: tolerance.toLowerCase() }))}
                  className={`${styles.optionButton} ${organization.riskTolerance === tolerance.toLowerCase() ? styles.selected : ''}`}
                >
                  {tolerance}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Legal Counsel</Label>
            <div className={styles.optionGrid}>
              {['Yes, we have in-house or external legal counsel', 'No, we handle legal matters ourselves'].map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setOrganization(prev => ({ ...prev, hasLegalCounsel: index === 0 }))}
                  className={`${styles.optionButton} ${organization.hasLegalCounsel === (index === 0) ? styles.selected : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <Button 
          onClick={onNext}
          disabled={!isValid}
          size="lg"
        >
          Continue to Legal Assessment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Step 4: Legal Context Assessment  
function LegalContextStep({ onNext, user }: { onNext: (contractId?: string) => void; user?: any }) {
  const [legalContext, setLegalContext] = useState({
    contractTypes: [] as string[],
    internationalWork: '',
    complianceNeeds: [] as string[],
    contractVolume: ''
  })

  const contractTypeOptions = [
    'Employment Agreements',
    'Service Contracts', 
    'Non-Disclosure Agreements',
    'Partnership Agreements',
    'Sales Contracts',
    'Rental/Lease Agreements',
    'Consulting Agreements',
    'Other Business Contracts'
  ]

  const complianceOptions = [
    'Data Privacy (GDPR, CCPA)',
    'Financial Regulations',
    'Healthcare Compliance',
    'International Trade',
    'Employment Law',
    'Intellectual Property',
    'Environmental Regulations'
  ]

  const handleTypeToggle = (type: string) => {
    const types = legalContext.contractTypes.includes(type)
      ? legalContext.contractTypes.filter(t => t !== type)
      : [...legalContext.contractTypes, type]
    setLegalContext(prev => ({ ...prev, contractTypes: types }))
  }

  const handleComplianceToggle = (compliance: string) => {
    const needs = legalContext.complianceNeeds.includes(compliance)
      ? legalContext.complianceNeeds.filter(c => c !== compliance)
      : [...legalContext.complianceNeeds, compliance]
    setLegalContext(prev => ({ ...prev, complianceNeeds: needs }))
  }

  const isValid = legalContext.contractTypes.length > 0 && legalContext.internationalWork && legalContext.contractVolume

  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Legal Context Assessment
        </h1>
        <p className={styles.heroSubtitle}>
          Help us understand your legal needs so our AI can provide the most relevant contract guidance.
        </p>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <Label>What types of contracts do you typically need?</Label>
            <div className={styles.optionGrid}>
              {contractTypeOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`${styles.optionButton} ${legalContext.contractTypes.includes(type) ? styles.selected : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Do you work with international partners or clients?</Label>
            <div className={styles.optionGrid}>
              {['Frequently', 'Occasionally', 'Rarely', 'Never'].map(frequency => (
                <button
                  key={frequency}
                  type="button"
                  onClick={() => setLegalContext(prev => ({ ...prev, internationalWork: frequency }))}
                  className={`${styles.optionButton} ${legalContext.internationalWork === frequency ? styles.selected : ''}`}
                >
                  {frequency}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>Key compliance areas for your business</Label>
            <div className={styles.optionGrid}>
              {complianceOptions.map(compliance => (
                <button
                  key={compliance}
                  type="button"
                  onClick={() => handleComplianceToggle(compliance)}
                  className={`${styles.optionButton} ${legalContext.complianceNeeds.includes(compliance) ? styles.selected : ''}`}
                >
                  {compliance}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label>How many contracts do you typically handle per month?</Label>
            <div className={styles.optionGrid}>
              {['1-5', '6-20', '21-50', '50+'].map(volume => (
                <button
                  key={volume}
                  type="button"
                  onClick={() => setLegalContext(prev => ({ ...prev, contractVolume: volume }))}
                  className={`${styles.optionButton} ${legalContext.contractVolume === volume ? styles.selected : ''}`}
                >
                  {volume}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <Button 
          onClick={onNext}
          disabled={!isValid}
          size="lg"
        >
          Continue to Pro Access
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Step 5: Pro Access
function ProAccessStep({ onNext, user }: { onNext: (contractId?: string) => void; user?: any }) {
  const [processing, setProcessing] = useState(false)

  const handleContinue = async () => {
    setProcessing(true)
    
    try {
      const supabase = createClient()
      
      // Get organization and legal context data from localStorage or state
      // In a real implementation, you'd pass this data down through the component tree
      const organizationData = {
        // This would come from the previous steps' state
        organizationType: 'Corporation', // placeholder
        industry: 'Technology', // placeholder
        companySize: '11-50 employees', // placeholder
        primaryJurisdiction: 'united-states', // placeholder
        additionalJurisdictions: [], // placeholder
        regulatoryRequirements: [], // placeholder
        riskTolerance: 'medium', // placeholder
        hasLegalCounsel: false // placeholder
      }
      
      const legalContextData = {
        contractTypes: ['Employment Agreements'], // placeholder
        internationalWork: 'Rarely', // placeholder
        complianceNeeds: [], // placeholder
        contractVolume: '1-5' // placeholder
      }
      
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'pro',
          subscription_status: 'active',
          onboarding_completed: true,
          // Add new legal profile fields
          organization_type: organizationData.organizationType,
          industry: organizationData.industry,
          company_size: organizationData.companySize,
          primary_jurisdiction: organizationData.primaryJurisdiction,
          additional_jurisdictions: organizationData.additionalJurisdictions,
          regulatory_requirements: organizationData.regulatoryRequirements,
          risk_tolerance: organizationData.riskTolerance,
          has_legal_counsel: organizationData.hasLegalCounsel,
          legal_context: {
            contractTypes: legalContextData.contractTypes,
            internationalWork: legalContextData.internationalWork,
            complianceNeeds: legalContextData.complianceNeeds,
            contractVolume: legalContextData.contractVolume
          }
        })
        .eq('id', user?.id)
      
      onNext()
    } catch (err) {
      console.error('Error setting up pro access:', err)
      onNext()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          You're all set!
        </h1>
        <p className={styles.heroSubtitle}>
          You now have full access to all Contract Manager Pro features.
        </p>
      </div>

      <div className={styles.proAccessSection}>
        <div className={styles.proAccessHeader}>
          <h2 className={styles.proAccessTitle}>Pro Features Unlocked</h2>
          <p className={styles.proAccessSubtitle}>Everything you need for professional contract management</p>
        </div>
        
        <ul className={styles.proFeaturesList}>
          <li>
            <Check className={styles.checkIcon} />
            Unlimited contract analysis
          </li>
          <li>
            <Check className={styles.checkIcon} />
            AI-powered risk detection
          </li>
          <li>
            <Check className={styles.checkIcon} />
            Smart contract insights
          </li>
          <li>
            <Check className={styles.checkIcon} />
            Export to PDF & Word
          </li>
          <li>
            <Check className={styles.checkIcon} />
            Advanced analytics
          </li>
          <li>
            <Check className={styles.checkIcon} />
            Priority support
          </li>
        </ul>
      </div>

      <div className={styles.actionSection}>
        <Button
          onClick={handleContinue}
          loading={processing}
          size="lg"
        >
          {processing ? 'Setting up...' : 'Continue to Upload'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Step 4: First Contract Upload (FIXED - Now actually uploads!)
function UploadStep({ onNext }: { onNext: (contractId?: string) => void; user?: any }) {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadedContractId, setUploadedContractId] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Please upload a DOCX file')
      return
    }

    try {
      setUploading(true)
      setUploadProgress('Processing document...')
      
      // Read file as ArrayBuffer and extract text (same as dashboard upload)
      const arrayBuffer = await file.arrayBuffer()
      setUploadProgress('Extracting text...')
      
      const result = await mammoth.extractRawText({ arrayBuffer })
      const extractedText = result.value
      
      if (!extractedText.trim()) {
        throw new Error('No text found in document')
      }
      
      // Extract title from filename
      const title = file.name.replace('.docx', '')
      
      setUploadProgress('Saving contract...')
      
      // Get current user
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')
      
      // Save to database using the same method as dashboard
      const contract = await contractsApi.create({
        user_id: user.id,
        title,
        content: extractedText,
        upload_url: null, // No URL since we're handling file directly
        file_key: null,   // No key since we're not using uploadthing
        analysis_cache: {}
      })
      
      // Store the contract ID for auto-loading in dashboard
      setUploadedContractId(contract.id)
      
      setUploadProgress('Upload complete!')
      
      // Wait a moment then redirect to dashboard with contract ID
      setTimeout(() => {
        onNext(contract.id)
      }, 1000)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to process contract: ${error.message}`)
      setUploading(false)
      setUploadProgress('')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Reset input
    e.target.value = ''
  }

  return (
    <div className={styles.contentSection}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Upload your first contract
        </h1>
        <p className={styles.heroSubtitle}>
          Upload a DOCX contract to see our AI analysis in action.
        </p>
      </div>

      <div className={styles.uploadSection}>
        <div 
          className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={styles.uploadContent}>
            {uploading ? (
              <>
                <div className="spinner spinner-lg"></div>
                <h3>{uploadProgress}</h3>
                <p>Our AI will analyze this contract on the dashboard</p>
              </>
            ) : (
              <>
                <Upload className={styles.uploadIcon} />
                <h3>Drop your contract here</h3>
                <p>or click to browse files</p>
                <span className={styles.fileTypeTag}>DOCX</span>
              </>
            )}
          </div>
          
          {!uploading && (
            <input
              type="file"
              className={styles.hiddenInput}
              accept=".docx"
              onChange={handleFileInput}
            />
          )}
        </div>
      </div>

      <div className={styles.actionSection}>
        <Button 
          onClick={() => {
            // Redirect to folders page when skipping
            router.push('/folders')
          }} 
          variant="secondary" 
          size="lg"
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}

// Lottie Animation Component
function AnimationDisplay({ animationPath }: { animationPath: string }) {
  const [animationData, setAnimationData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(() => setError(true))
  }, [animationPath])

  if (error || !animationData) {
    // Fallback to placeholder if animation fails to load
    return (
      <div className={styles.animationFallback}>
        <div className={styles.placeholderIcon}>
          <FileText size={64} color="var(--color-text-secondary)" />
        </div>
      </div>
    )
  }

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px' }}
    />
  )
}

// Main Onboarding Component
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [uploadedContractId, setUploadedContractId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
  }

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      subtitle: 'Getting started',
      animationPath: '/lottie/welcome.json',
      component: WelcomeStep
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'About you',
      animationPath: '/lottie/profile.json',
      component: ProfileStep
    },
    {
      id: 'organization',
      title: 'Organization',
      subtitle: 'Business context',
      animationPath: '/lottie/organization.json',
      component: OrganizationStep
    },
    {
      id: 'legal-context',
      title: 'Legal Needs',
      subtitle: 'Contract requirements',
      animationPath: '/lottie/legal-context.json',
      component: LegalContextStep
    },
    {
      id: 'access',
      title: 'Access',
      subtitle: 'Pro features',
      animationPath: '/lottie/access.json',
      component: ProAccessStep
    },
    {
      id: 'upload',
      title: 'Upload',
      subtitle: 'First contract',
      animationPath: '/lottie/upload.json',
      component: UploadStep
    }
  ]

  const nextStep = (contractId?: string) => {
    if (contractId) {
      setUploadedContractId(contractId)
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding(contractId)
    }
  }

  const completeOnboarding = async (contractId?: string) => {
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user?.id)
    
    // If a contract was uploaded, redirect to dashboard with contract ID to auto-select it
    if (contractId) {
      router.push(`/dashboard?contractId=${contractId}`)
    } else {
      router.push('/dashboard')
    }
  }

  const CurrentStepComponent = steps[currentStep]?.component
  const currentStepData = steps[currentStep]

  if (!user) {
    return (
      <div className={styles.loading}>
        <div className="spinner spinner-lg"></div>
        <h3>Loading...</h3>
        <p>Setting up your account</p>
      </div>
    )
  }

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.onboardingContent}>
        {/* Left Panel - Content */}
        <div className={styles.leftPanel}>
          {/* Progress Section */}
          <div className={styles.progressSection}>
            <div className={styles.stepIndicator}>
              <div className={styles.stepNumber}>
                {currentStep + 1}
              </div>
              <div className={styles.stepInfo}>
                <h2 className={styles.stepTitle}>{currentStepData?.title}</h2>
                <p className={styles.stepSubtitle}>{currentStepData?.subtitle}</p>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {CurrentStepComponent && (
            <CurrentStepComponent onNext={nextStep} user={user} />
          )}
        </div>

        {/* Right Panel - Lottie Animation */}
        <div className={styles.rightPanel}>
          <div className={styles.imageContainer}>
            <AnimationDisplay animationPath={currentStepData?.animationPath} />
          </div>
        </div>
      </div>
    </div>
  )
}