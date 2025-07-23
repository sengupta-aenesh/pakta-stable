'use client'

import JurisdictionSelector from '@/components/onboarding/jurisdiction-selector'

interface SingleJurisdictionSelectorProps {
  value: string
  onChange: (value: string) => void
  excludeJurisdictions?: string[]
  placeholder?: string
  label?: string
}

export default function SingleJurisdictionSelector({
  value,
  onChange,
  excludeJurisdictions = [],
  placeholder,
  label
}: SingleJurisdictionSelectorProps) {
  const handleChange = (jurisdictions: string[]) => {
    // For single selection, take the first item if any
    if (jurisdictions.length > 0) {
      onChange(jurisdictions[0])
    }
  }

  return (
    <JurisdictionSelector
      selectedJurisdictions={value ? [value] : []}
      onJurisdictionsChange={handleChange}
      excludeJurisdictions={excludeJurisdictions}
      placeholder={placeholder}
      label={label}
      maxSelections={1}
    />
  )
}