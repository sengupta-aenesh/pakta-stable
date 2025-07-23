import { jurisdictionData } from './jurisdiction-data'

/**
 * Convert a jurisdiction key to its display name
 * @param key - The jurisdiction key (e.g., 'united-states')
 * @returns The display name (e.g., 'United States')
 */
export function getJurisdictionName(key: string): string {
  return jurisdictionData[key]?.name || key
}

/**
 * Convert a jurisdiction display name to its key
 * @param name - The jurisdiction name (e.g., 'United States')
 * @returns The key (e.g., 'united-states')
 */
export function getJurisdictionKey(name: string): string {
  // Check if it's already a key
  if (jurisdictionData[name]) return name
  
  // Otherwise, find the key by matching the name
  const entry = Object.entries(jurisdictionData).find(
    ([_, data]) => data.name === name
  )
  return entry ? entry[0] : name
}

/**
 * Ensure we have a valid jurisdiction key
 * @param value - Either a key or display name
 * @returns A valid jurisdiction key, defaulting to 'united-states'
 */
export function normalizeJurisdiction(value: string | undefined | null): string {
  if (!value) return 'united-states'
  
  // Try as key first
  if (jurisdictionData[value]) return value
  
  // Try to find by name
  const key = getJurisdictionKey(value)
  return jurisdictionData[key] ? key : 'united-states'
}

/**
 * Get jurisdiction data with fallback
 */
export function getJurisdictionData(keyOrName: string) {
  const key = normalizeJurisdiction(keyOrName)
  return jurisdictionData[key]
}