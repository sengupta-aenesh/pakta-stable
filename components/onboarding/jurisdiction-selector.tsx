'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Search, MapPin } from 'lucide-react'
import { jurisdictionData, searchJurisdictions, JurisdictionData } from '@/lib/jurisdiction-data'
import styles from './jurisdiction-selector.module.css'

interface JurisdictionSelectorProps {
  selectedJurisdictions: string[]
  onJurisdictionsChange: (jurisdictions: string[]) => void
  placeholder?: string
  label?: string
  maxSelections?: number
  excludeJurisdictions?: string[]
}

export default function JurisdictionSelector({
  selectedJurisdictions,
  onJurisdictionsChange,
  placeholder = "Search and select jurisdictions...",
  label,
  maxSelections,
  excludeJurisdictions = []
}: JurisdictionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<JurisdictionData[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoize the excluded jurisdictions to prevent infinite re-renders
  const memoizedExcludeJurisdictions = useMemo(() => excludeJurisdictions, [excludeJurisdictions.join(',')])

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchJurisdictions(searchQuery)
        .filter(jurisdiction => {
          const key = Object.keys(jurisdictionData).find(k => jurisdictionData[k] === jurisdiction)
          return key && !selectedJurisdictions.includes(key) && !memoizedExcludeJurisdictions.includes(key)
        })
      setSearchResults(results)
    } else {
      // Show popular jurisdictions when no search query
      const popular = ['united-states', 'united-kingdom', 'canada', 'australia', 'singapore', 'germany']
        .filter(key => !selectedJurisdictions.includes(key) && !memoizedExcludeJurisdictions.includes(key))
        .map(key => jurisdictionData[key])
        .filter(Boolean)
      setSearchResults(popular)
    }
  }, [searchQuery, selectedJurisdictions, memoizedExcludeJurisdictions])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleJurisdictionSelect = (jurisdiction: JurisdictionData) => {
    const key = Object.keys(jurisdictionData).find(k => jurisdictionData[k] === jurisdiction)
    if (!key) return

    if (maxSelections === 1) {
      // For single selection, replace the current selection
      onJurisdictionsChange([key])
    } else {
      // For multiple selections, add to the list if not at max
      if (maxSelections && selectedJurisdictions.length >= maxSelections) {
        return
      }
      const newJurisdictions = [...selectedJurisdictions, key]
      onJurisdictionsChange(newJurisdictions)
    }
    
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleJurisdictionRemove = (keyToRemove: string) => {
    const newJurisdictions = selectedJurisdictions.filter(key => key !== keyToRemove)
    onJurisdictionsChange(newJurisdictions)
  }

  const selectedJurisdictionData = useMemo(() => 
    selectedJurisdictions
      .map(key => ({ key, data: jurisdictionData[key] }))
      .filter(item => item.data),
    [selectedJurisdictions]
  )

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      {/* Selected Jurisdictions Tags - Only show for multiple selections */}
      {selectedJurisdictionData.length > 0 && maxSelections !== 1 && (
        <div className={styles.selectedTags}>
          {selectedJurisdictionData.map(({ key, data }) => (
            <div key={key} className={styles.tag}>
              <span className={styles.tagFlag}>{data.flag}</span>
              <span className={styles.tagName}>{data.name}</span>
              <button
                type="button"
                onClick={() => handleJurisdictionRemove(key)}
                className={styles.tagRemove}
                aria-label={`Remove ${data.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchInputContainer}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={
              maxSelections === 1 && selectedJurisdictionData.length > 0
                ? `${selectedJurisdictionData[0].data.flag} ${selectedJurisdictionData[0].data.name}`
                : placeholder
            }
            className={styles.searchInput}
            disabled={false}
          />
          {/* Clear button for single selections */}
          {maxSelections === 1 && selectedJurisdictionData.length > 0 && (
            <button
              type="button"
              onClick={() => handleJurisdictionRemove(selectedJurisdictions[0])}
              className={styles.clearButton}
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Dropdown Results */}
        {isOpen && (
          <div className={styles.dropdown}>
            {searchResults.length > 0 ? (
              <>
                {!searchQuery.trim() && (
                  <div className={styles.dropdownHeader}>
                    <MapPin className="w-4 h-4" />
                    <span>Popular Jurisdictions</span>
                  </div>
                )}
                
                {searchResults.map((jurisdiction) => {
                  const key = Object.keys(jurisdictionData).find(k => jurisdictionData[k] === jurisdiction)
                  if (!key) return null
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleJurisdictionSelect(jurisdiction)}
                      className={styles.dropdownItem}
                    >
                      <span className={styles.itemFlag}>{jurisdiction.flag}</span>
                      <div className={styles.itemContent}>
                        <div className={styles.itemName}>{jurisdiction.name}</div>
                        <div className={styles.itemCode}>{jurisdiction.code}</div>
                      </div>
                    </button>
                  )
                })}
              </>
            ) : (
              <div className={styles.noResults}>
                No jurisdictions found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {maxSelections && maxSelections > 1 && (
        <div className={styles.hint}>
          {selectedJurisdictions.length}/{maxSelections} selected
        </div>
      )}
    </div>
  )
}