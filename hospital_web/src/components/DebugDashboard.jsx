import React, { useState } from 'react'
import { testConnection, testAuth, fetchAllTables, subscribeToRealtime, getSupabaseEnvInfo } from '../lib/supabaseDebug'

export function DebugDashboard({ visible = true }) {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const runFullDiagnostic = async () => {
    setLoading(true)
    try {
      console.log('🔍 Starting full diagnostic...')

      const authInfo = await testAuth()
      const connInfo = await testConnection()
      const tableInfo = await fetchAllTables()
      const unsubscribe = subscribeToRealtime()

      const info = {
        timestamp: new Date().toISOString(),
        auth: authInfo,
        connection: connInfo,
        tables: tableInfo,
        env: getSupabaseEnvInfo(),
      }

      setDebugInfo(info)
      console.log('✅ Diagnostic complete:', info)

      setTimeout(() => unsubscribe(), 5000)
    } catch (err) {
      console.error('❌ Diagnostic failed:', err)
      setDebugInfo({ error: err.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  if (!visible) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0,0,0,0.92)',
      color: '#0f0',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '11px',
      maxWidth: '420px',
      maxHeight: '520px',
      overflowY: 'auto',
      zIndex: 9999,
      border: '2px solid #0f0'
    }}>
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>🐛 DEV DEBUG PANEL</div>

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

      <div style={{ marginBottom: '12px', fontSize: '10px', color: '#ccc' }}>
        Developer mode is active when `NODE_ENV=development` or when the URL includes `?debug=true`.
      </div>

      {debugInfo && (
        <div style={{ fontSize: '10px' }}>
          <div><strong>Supabase env</strong></div>
          <div>URL: {debugInfo.env.url ? `${debugInfo.env.url.slice(0, 30)}...` : 'MISSING'}</div>
          <div>Key loaded: {debugInfo.env.keyLoaded ? 'YES' : 'NO'}</div>
          {debugInfo.env.missing && (
            <div style={{ color: '#f00' }}>Missing fields: {debugInfo.env.missingFields.join(', ')}</div>
          )}

          <hr style={{ borderColor: '#0f0', margin: '8px 0' }} />

          <div>
            <div style={{ color: debugInfo.auth?.success ? '#0f0' : '#f00' }}>
              Auth test: {debugInfo.auth?.success ? '✅ OK' : '❌ FAILED'}
            </div>
            {debugInfo.auth?.error && <div style={{ color: '#f00' }}>{debugInfo.auth.error}</div>}
            {debugInfo.auth?.user && (
              <div style={{ color: '#0f0' }}>User ID: {debugInfo.auth.user.id}</div>
            )}
          </div>

          <hr style={{ borderColor: '#0f0', margin: '8px 0' }} />

          <div>
            <div style={{ color: debugInfo.connection?.success ? '#0f0' : '#f00' }}>
              Connection test: {debugInfo.connection?.success ? '✅ OK' : '❌ FAILED'}
            </div>
            {debugInfo.connection?.error && <div style={{ color: '#f00' }}>{debugInfo.connection.error}</div>}
          </div>

          <hr style={{ borderColor: '#0f0', margin: '8px 0' }} />

          <div>
            <div>👥 Donors: {debugInfo.tables?.donors?.length || 0}</div>
            <div>🏥 Hospitals: {debugInfo.tables?.hospitals?.length || 0}</div>
            <div>🩸 Requests: {debugInfo.tables?.requests?.length || 0}</div>
          </div>
          {debugInfo.tables?.errors?.length > 0 && (
            <div style={{ marginTop: '8px', color: '#f88' }}>
              <div><strong>Table fetch errors</strong></div>
              {debugInfo.tables.errors.map((err, idx) => (
                <div key={idx}>{err.table}: {err.message}</div>
              ))}
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
