import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { ShieldCheck, ShieldAlert, Users, Hospital, Bell, Search, Filter, CheckCircle, XCircle, Activity } from 'lucide-react'

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ donors: 0, hospitals: 0, requests: 0 })
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'verified'

  useEffect(() => {
    fetchInitialData()
    
    // Real-time subscriptions for admin monitoring
    const hChannel = supabase.channel('admin_hospitals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, fetchHospitals)
      .subscribe()
      
    const rChannel = supabase.channel('admin_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, fetchRequests)
      .subscribe()

    return () => {
      supabase.removeChannel(hChannel)
      supabase.removeChannel(rChannel)
    }
  }, [])

  async function fetchInitialData() {
    setLoading(true)
    await Promise.all([
      fetchStats(),
      fetchHospitals(),
      fetchRequests()
    ])
    setLoading(false)
  }

  async function fetchStats() {
    const [dCount, hCount, rCount] = await Promise.all([
      supabase.from('donors').select('*', { count: 'exact', head: true }),
      supabase.from('hospitals').select('*', { count: 'exact', head: true }),
      supabase.from('blood_requests').select('*', { count: 'exact', head: true })
    ])
    setStats({
      donors: dCount.count || 0,
      hospitals: hCount.count || 0,
      requests: rCount.count || 0
    })
  }

  async function fetchHospitals() {
    const { data } = await supabase
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setHospitals(data)
  }

  async function fetchRequests() {
    const { data } = await supabase
      .from('blood_requests')
      .select('*, hospital:hospitals(name)')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setRequests(data)
  }

  async function toggleVerification(hospitalId, currentStatus) {
    const { error } = await supabase
      .from('hospitals')
      .update({ is_verified: !currentStatus })
      .eq('id', hospitalId)
    
    if (error) {
      toast.error('Error updating verification: ' + error.message)
    } else {
      toast.success(currentStatus ? 'Verification revoked' : 'Hospital verified successfully!')
      fetchHospitals()
    }
  }

  const filteredHospitals = hospitals.filter(h => {
    if (filter === 'pending') return !h.is_verified
    if (filter === 'verified') return h.is_verified
    return true
  })

  if (loading) return <div className="flex-center" style={{ height: '80vh' }}>Loading Admin Panel...</div>

  return (
    <div className="dashboard-container fade-in">
      {/* Stats Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex-between">
            <Users size={24} className="text-secondary" />
            <span className="stat-value">{stats.donors}</span>
          </div>
          <p className="stat-label">Total Donors</p>
        </div>
        <div className="stat-card">
          <div className="flex-between">
            <Hospital size={24} className="text-accent" />
            <span className="stat-value">{stats.hospitals}</span>
          </div>
          <p className="stat-label">Medical Facilities</p>
        </div>
        <div className="stat-card">
          <div className="flex-between">
            <Bell size={24} className="text-primary" />
            <span className="stat-value">{stats.requests}</span>
          </div>
          <p className="stat-label">Emergency Alerts</p>
        </div>
      </div>

      <div className="admin-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        
        {/* Hospital Verification Section */}
        <div className="card glass">
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2 className="section-title flex-center" style={{ gap: '10px' }}>
              <ShieldCheck size={20} /> Hospital Verification
            </h2>
            <div className="flex-center" style={{ gap: '8px' }}>
              <button onClick={() => setFilter('all')} className={`chip ${filter === 'all' ? 'active' : ''}`}>All</button>
              <button onClick={() => setFilter('pending')} className={`chip ${filter === 'pending' ? 'active' : ''}`}>Pending</button>
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.city}</td>
                    <td>
                      {h.is_verified ? (
                        <span className="badge badge-success flex-center" style={{ gap: '4px' }}>
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="badge badge-warning flex-center" style={{ gap: '4px' }}>
                          <ShieldAlert size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleVerification(h.id, h.is_verified)}
                        className={`btn-icon ${h.is_verified ? 'btn-danger' : 'btn-success'}`}
                        title={h.is_verified ? 'Revoke Verification' : 'Approve Facility'}
                      >
                        {h.is_verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Network Activity */}
        <div className="card glass">
          <h2 className="section-title flex-center" style={{ gap: '10px', marginBottom: '20px' }}>
            <Activity size={20} /> Live Activity
          </h2>
          <div className="activity-feed">
            {requests.map(req => (
              <div key={req.id} className="activity-item">
                <div className="urgency-line" style={{ backgroundColor: req.urgency === 'Critical' ? 'var(--primary)' : 'var(--secondary)' }} />
                <div style={{ flex: 1 }}>
                  <p className="activity-desc"><strong>{req.hospital?.name}</strong> requested <strong>{req.blood_group}</strong></p>
                  <p className="activity-meta">{new Date(req.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
