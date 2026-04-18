import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { testConnection, fetchAllTables, subscribeToRealtime } from '../lib/supabaseDebug'

export function DebugDashboard() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const runFullDiagnostic = async () => {
    setLoading(true)
    try {
      console.log('🔍 Starting full diagnostic...')

      // Test connection
      const connTest = await testConnection()
      
      // Fetch all tables
      const tableData = await fetchAllTables()
      
      // Subscribe to realtime
      const unsubscribe = await subscribeToRealtime()

      const info = {
        timestamp: new Date().toISOString(),
        connection: connTest,
        tables: tableData,
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
        keyLoaded: !!process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY,
      }

      setDebugInfo(info)
      console.log('✅ Diagnostic complete:', info)

      // Cleanup after 5 seconds
      setTimeout(unsubscribe, 5000)
    } catch (err) {
      console.error('❌ Diagnostic failed:', err)
      setDebugInfo({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '11px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflowY: 'auto',
      zIndex: 9999,
      border: '2px solid #0f0'
    }}>
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>🐛 DEBUG PANEL</div>
      
      <button
        onClick={runFullDiagnostic}
        disabled={loading}
        style={{
          padding: '8px 12px',
          background: '#0f0',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%',
          marginBottom: '12px'
        }}
      >
        {loading ? '⏳ Running...' : '▶️ RUN DIAGNOSTIC'}
      </button>

      {debugInfo && (
        <div style={{ fontSize: '10px' }}>
          <div>✅ Supabase URL: {process.env.REACT_APP_SUPABASE_URL?.slice(0, 30)}...</div>
          <div>✅ Key Loaded: {debugInfo.keyLoaded ? 'YES' : 'NO'}</div>
          <hr style={{ borderColor: '#0f0', margin: '8px 0' }} />
          
          <div>
            <div style={{ color: debugInfo.connection?.success ? '#0f0' : '#f00' }}>
              Connection: {debugInfo.connection?.success ? '✅ OK' : '❌ FAILED'}
            </div>
            {debugInfo.connection?.error && <div style={{ color: '#f00' }}>{debugInfo.connection.error}</div>}
          </div>

          <hr style={{ borderColor: '#0f0', margin: '8px 0' }} />

          <div>
            <div>👥 Donors: {debugInfo.tables?.donors?.length || 0}</div>
            <div>🏥 Hospitals: {debugInfo.tables?.hospitals?.length || 0}</div>
            <div>🩸 Requests: {debugInfo.tables?.requests?.length || 0}</div>
          </div>

          {debugInfo.tables?.donors?.length > 0 && (
            <div style={{ marginTop: '8px', color: '#0f0' }}>
              Sample donor: {debugInfo.tables.donors[0].name}
            </div>
          )}

          {debugInfo.tables?.hospitals?.length > 0 && (
            <div style={{ color: '#0f0' }}>
              Sample hospital: {debugInfo.tables.hospitals[0].name}
            </div>
          )}

          <div style={{ marginTop: '8px', fontSize: '9px', color: '#888' }}>
            Updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugDashboard
