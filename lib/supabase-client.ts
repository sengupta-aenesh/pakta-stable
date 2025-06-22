'use client'

import { createClient } from '@/lib/supabase/client'
import type { Contract } from '@/lib/types'

// Re-export createClient for backward compatibility
export { createClient }

// Client-side helper functions for database operations
export const contractsApi = {
  async getAll(userId: string): Promise<Contract[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  async getById(id: string): Promise<Contract | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async update(id: string, updates: Partial<Contract>): Promise<Contract> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async delete(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },
  
  async updateAnalysisCache(id: string, analysisType: string, data: any): Promise<void> {
    const supabase = createClient()
    
    const { data: contract } = await supabase
      .from('contracts')
      .select('analysis_cache')
      .eq('id', id)
      .single()
    
    const updatedCache = {
      ...(contract?.analysis_cache || {}),
      [analysisType]: data,
      lastAnalyzed: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('contracts')
      .update({ analysis_cache: updatedCache })
      .eq('id', id)
    
    if (error) throw error
  }
}

// Export Contract type for convenience
export type { Contract }