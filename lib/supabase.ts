import type { Contract } from '@/lib/types'

// Helper functions for database operations
export const contractsApi = {
  async getAll(userId: string): Promise<Contract[]> {
    // Dynamic import to avoid loading server code in client
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
    throw new Error('This function can only be called on the server')
  },
  
  async getById(id: string): Promise<Contract | null> {
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
    throw new Error('This function can only be called on the server')
  },
  
  async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('contracts')
        .insert(contract)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
    throw new Error('This function can only be called on the server')
  },
  
  async update(id: string, updates: Partial<Contract>): Promise<Contract> {
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
    throw new Error('This function can only be called on the server')
  },
  
  async delete(id: string): Promise<void> {
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } else {
      throw new Error('This function can only be called on the server')
    }
  },
  
  async updateAnalysisCache(id: string, analysisType: string, data: any): Promise<void> {
    if (typeof window === 'undefined') {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data: contract } = await supabase
        .from('contracts')
        .select('analysis_cache')
        .eq('id', id)
        .single()
      
      let updatedCache;
      
      // Handle batch updates
      if (analysisType === 'batch') {
        updatedCache = {
          ...(contract?.analysis_cache || {}),
          ...data, // Spread all the batch data
          lastAnalyzed: new Date().toISOString()
        }
      } else {
        // Handle single updates
        updatedCache = {
          ...(contract?.analysis_cache || {}),
          [analysisType]: data,
          lastAnalyzed: new Date().toISOString()
        }
      }
      
      const { error } = await supabase
        .from('contracts')
        .update({ analysis_cache: updatedCache })
        .eq('id', id)
      
      if (error) throw error
    } else {
      throw new Error('This function can only be called on the server')
    }
  }
}

// Export Contract type for convenience
export type { Contract }