import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useDonorAuth } from '../../hooks/useDonorAuth';
import { Theme } from '../../theme';
import { ShieldCheck, ShieldAlert, Hospital, Activity, CheckCircle, XCircle, Power } from 'lucide-react-native';

export default function AdminScreen() {
  const { role, loading: authLoading } = useDonorAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [stats, setStats] = useState({ donors: 0, requests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminData();
    }
  }, [role]);

  async function fetchAdminData() {
    setLoading(true);
    const [hRes, dRes, rRes] = await Promise.all([
      supabase.from('hospitals').select('*').order('created_at', { ascending: false }),
      supabase.from('donors').select('*', { count: 'exact', head: true }),
      supabase.from('blood_requests').select('*', { count: 'exact', head: true })
    ]);

    if (hRes.data) setHospitals(hRes.data);
    setStats({
      donors: dRes.count || 0,
      requests: rRes.count || 0
    });
    setLoading(false);
  }

  async function toggleHospital(id: string, current: boolean) {
    const { error } = await supabase
      .from('hospitals')
      .update({ is_verified: !current })
      .eq('id', id);

    if (error) Alert.alert('Error', error.message);
    else fetchAdminData();
  }

  async function systemKillswitch() {
    Alert.alert(
      "☢️ SYSTEM KILLSWITCH",
      "This will immediately terminate ALL active blood requests across the entire network. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "TERMINATE ALL", 
          style: "destructive",
          onPress: async () => {
             const { error } = await supabase
               .from('blood_requests')
               .update({ status: 'closed' })
               .eq('status', 'open');
             if (!error) Alert.alert("Success", "All active requests have been terminated.");
          }
        }
      ]
    );
  }

  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (role !== 'admin') {
    return (
      <View style={[styles.container, styles.center]}>
        <ShieldAlert size={64} color={Theme.colors.primary} />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorSub}>This area is reserved for LifeLink Administrators.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Quick Actions */}
        <View style={styles.killswitchCard}>
           <View>
              <Text style={styles.killswitchTitle}>Network Control</Text>
              <Text style={styles.killswitchSub}>Emergency system-wide shutdown</Text>
           </View>
           <TouchableOpacity style={styles.killBtn} onPress={systemKillswitch}>
              <Power size={24} color="white" />
           </TouchableOpacity>
        </View>

        {/* System Stats */}
        <View style={styles.statsRow}>
           <View style={styles.statBox}>
              <Activity size={20} color={Theme.colors.secondary} />
              <Text style={styles.statValue}>{stats.requests}</Text>
              <Text style={styles.statLabel}>Total Alerts</Text>
           </View>
           <View style={styles.statBox}>
              <ShieldCheck size={20} color={Theme.colors.accent} />
              <Text style={styles.statValue}>{stats.donors}</Text>
              <Text style={styles.statLabel}>Verified Donors</Text>
           </View>
        </View>

        {/* Hospital Approval List */}
        <Text style={styles.sectionTitle}>Hospital Verification</Text>
        {hospitals.map(h => (
           <View key={h.id} style={styles.hospitalCard}>
              <View style={styles.hInfo}>
                 <Hospital size={24} color={h.is_verified ? Theme.colors.accent : Theme.colors.textMuted} />
                 <View>
                    <Text style={styles.hName}>{h.name}</Text>
                    <Text style={styles.hCity}>{h.city}</Text>
                 </View>
              </View>
              <TouchableOpacity 
                style={[styles.toggleBtn, { backgroundColor: h.is_verified ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}
                onPress={() => toggleHospital(h.id, h.is_verified)}
              >
                {h.is_verified ? <XCircle size={24} color={Theme.colors.primary} /> : <CheckCircle size={24} color={Theme.colors.accent} />}
              </TouchableOpacity>
           </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  killswitchCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  killswitchTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  killswitchSub: {
    color: Theme.colors.primary,
    fontSize: 12,
  },
  killBtn: {
    backgroundColor: Theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: Theme.spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    ...Theme.typography.h2,
    color: 'white',
    marginBottom: Theme.spacing.md,
  },
  hospitalCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  hInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hCity: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    ...Theme.typography.h1,
    color: 'white',
    marginTop: 20,
  },
  errorSub: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  }
});
