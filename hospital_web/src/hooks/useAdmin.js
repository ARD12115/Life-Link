import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    async function checkAdmin() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data && data.role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        logger.error('Error checking admin status', { error: err instanceof Error ? err.message : 'Unknown' })
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  return { isAdmin, loading }
}
