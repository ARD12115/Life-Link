import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useDonorAuth } from '../../hooks/useDonorAuth';
import { useRequests } from '../../hooks/useRequests';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';
import { Theme } from '../../theme';
import { Droplets, Heart, MapPin, Bell, ShieldCheck, Activity, Phone, Hospital, Clock, ChevronRight } from 'lucide-react-native';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function HomeScreen() {
  const { user, donor, loading: authLoading, signInAnonymously, completeOnboarding } = useDonorAuth();
  const { requests, loading: requestsLoading, respondToRequest } = useRequests(donor?.blood_group);
  const { expoPushToken } = usePushNotifications(user?.id);
  const [form, setForm] = useState({ name: '', bloodGroup: 'O+', city: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const sendTestPush = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🩸 LifeLink Emergency",
        body: `URGENT: ${donor?.blood_group || 'Blood'} needed at nearby hospital!`,
        data: { data: 'test' },
      },
      trigger: null,
    });
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const handleResponse = async (requestId: string) => {
    if (!donor) return;
    const { error } = await respondToRequest(requestId, donor.id);
    if (error) {
      Alert.alert('Error', 'Could not send response. Please try again.');
    } else {
      Alert.alert('Success', 'Hospital notified! Please head to the facility.');
    }
  };

  // ONBOARDING FLOW
  if (!user || !donor) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Heart size={48} color={Theme.colors.primary} fill={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>Become a Hero</Text>
            <Text style={styles.subtitle}>Join the LifeLink network and start saving lives in your city instantly.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your name" 
              placeholderTextColor={Theme.colors.textMuted}
              value={form.name}
              onChangeText={(t) => setForm({...form, name: t})}
            />

            <Text style={styles.label}>Blood Group</Text>
            <View style={styles.bloodGrid}>
              {BLOOD_GROUPS.map(bg => (
                <TouchableOpacity 
                  key={bg} 
                  style={[styles.bloodItem, form.bloodGroup === bg && styles.bloodItemActive]}
                  onPress={() => setForm({...form, bloodGroup: bg})}
                >
                  <Text style={[styles.bloodText, form.bloodGroup === bg && styles.bloodTextActive]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>City</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Mumbai" 
              placeholderTextColor={Theme.colors.textMuted}
              value={form.city}
              onChangeText={(t) => setForm({...form, city: t})}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="For emergency alerts" 
              keyboardType="phone-pad"
              placeholderTextColor={Theme.colors.textMuted}
              value={form.phone}
              onChangeText={(t) => setForm({...form, phone: t})}
            />

            <TouchableOpacity 
              style={styles.submitBtn} 
              disabled={submitting}
              onPress={async () => {
                setSubmitting(true);
                if (!user) await signInAnonymously();
                await completeOnboarding(form.name, form.bloodGroup, form.city, form.phone);
                setSubmitting(false);
              }}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Initializing...' : 'Complete Profile'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // MAIN DASHBOARD
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.donorName}>{donor.name}</Text>
          </View>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{donor.blood_group}</Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
             <ShieldCheck size={20} color={Theme.colors.accent} />
             <Text style={styles.statusText}>Verified Donor</Text>
          </View>
          <View style={styles.statusItem}>
             <Activity size={20} color={Theme.colors.secondary} />
             <Text style={styles.statusText}>Active Now</Text>
          </View>
        </View>

        {/* Emergency Alert Center */}
        <View style={styles.alertCenter}>
           <View style={styles.alertHeader}>
              <Bell size={24} color={Theme.colors.primary} />
              <Text style={styles.alertTitle}>Emergency Alerts</Text>
              {requests.length > 0 && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
           </View>
           
           {requests.length === 0 ? (
              <View style={styles.emptyAlerts}>
                <Activity size={48} color={Theme.colors.border} />
                <Text style={styles.emptyAlertsText}>No active emergencies nearby.</Text>
                <Text style={styles.emptyAlertsSub}>We'll notify you instantly if someone needs your {donor.blood_group} blood.</Text>
              </View>
           ) : (
             <View style={styles.requestList}>
                {requests.map(req => (
                  <TouchableOpacity key={req.id} style={styles.requestCard} onPress={() => handleResponse(req.id)}>
                    <View style={styles.requestInfo}>
                       <View style={[styles.urgencyDot, { backgroundColor: req.urgency === 'Critical' ? Theme.colors.primary : Theme.colors.secondary }]} />
                       <View>
                          <Text style={styles.hospitalName}>{req.hospital?.name || 'Medical Facility'}</Text>
                          <Text style={styles.locationText}>{req.hospital?.city || 'Nearby'}</Text>
                       </View>
                    </View>
                    <View style={styles.actionArea}>
                       <Text style={styles.timeText}>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                       <ChevronRight size={20} color={Theme.colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
             </View>
           )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
           <View style={styles.statCard}>
              <Droplets size={24} color={Theme.colors.primary} />
              <Text style={styles.statValue}>{donor.total_donations || 0}</Text>
              <Text style={styles.statLabel}>Donations</Text>
           </View>
           <View style={styles.statCard}>
              <MapPin size={24} color={Theme.colors.secondary} />
              <Text style={styles.statValue}>{donor.city}</Text>
              <Text style={styles.statLabel}>Location</Text>
           </View>
        </View>

        {/* Native Simulation Button */}
        <TouchableOpacity style={styles.simulationBtn} onPress={sendTestPush}>
           <Text style={styles.simulationBtnText}>Test Native Push</Text>
        </TouchableOpacity>

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
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: Theme.spacing.xxl,
    marginBottom: Theme.spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  label: {
    ...Theme.typography.caption,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    color: Theme.colors.text,
    fontSize: 16,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.lg,
  },
  bloodItem: {
    width: '23%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  bloodItemActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: 'white',
  },
  bloodText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
  bloodTextActive: {
    color: 'white',
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.md,
  },
  greeting: {
    ...Theme.typography.caption,
  },
  donorName: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
  },
  bloodBadge: {
    backgroundColor: Theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  bloodBadgeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: Theme.spacing.xl,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statusText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  alertCenter: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.xl,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },
  alertTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text,
  },
  emptyAlerts: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyAlertsText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyAlertsSub: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    ...Theme.typography.caption,
  },
  simulationBtn: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    opacity: 0.7,
  },
  simulationBtnText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  liveBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hospitalName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  }
});
