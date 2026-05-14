import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useDonorAuth } from '../../hooks/useDonorAuth';
import { useRequests } from '../../hooks/useRequests';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../theme';
import { Droplets, Heart, MapPin, Bell, ShieldCheck, Activity, Phone, Hospital, Clock, ChevronRight } from 'lucide-react-native';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function DonorDashboard() {
  const { user, donor, loading: authLoading, signInAnonymously, completeOnboarding } = useDonorAuth();
  const { requests, loading: requestsLoading, respondToRequest, refetch } = useRequests(donor?.blood_group);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
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
    
    // Haptic feedback for tactile confirmation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
    );
  }

  // MAIN DASHBOARD
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
        }
      >
        {/* Hero Header: Focus on Impact */}
        <View style={styles.heroHeader}>
           <Text style={styles.impactTitle}>Your Impact</Text>
           <View style={styles.impactCard}>
              <View style={styles.impactItem}>
                 <Heart size={32} color="white" fill="white" />
                 <Text style={styles.impactValue}>{donor.total_donations || 0}</Text>
                 <Text style={styles.impactLabel}>Lives Saved</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                 <Droplets size={32} color="white" />
                 <Text style={styles.impactValue}>{donor.blood_group}</Text>
                 <Text style={styles.impactLabel}>Blood Type</Text>
              </View>
           </View>
        </View>

        {/* Tactical Emergency Center */}
        <View style={styles.missionCenter}>
           <View style={styles.sectionHeader}>
              <Activity size={20} color={Theme.colors.primary} />
              <Text style={styles.sectionTitle}>ACTIVE MISSIONS</Text>
              {requests.length > 0 && <View style={styles.livePulse} />}
           </View>
           
           {requests.length === 0 ? (
              <View style={styles.idleState}>
                 <ShieldCheck size={48} color={Theme.colors.border} />
                 <Text style={styles.idleTitle}>System Secure</Text>
                 <Text style={styles.idleSub}>No emergencies needing {donor.blood_group} in {donor.city} right now.</Text>
              </View>
           ) : (
              <View style={styles.missionList}>
                 {requests.map(req => (
                   <TouchableOpacity key={req.id} style={styles.missionCard} onPress={() => handleResponse(req.id)}>
                     <View style={styles.missionMain}>
                        <View style={styles.hospitalInfo}>
                           <Hospital size={18} color={Theme.colors.primary} />
                           <Text style={styles.hospitalName}>{req.hospital?.name}</Text>
                        </View>
                        <View style={styles.unitBadge}>
                           <Text style={styles.unitText}>{req.units_needed}U</Text>
                        </View>
                     </View>
                     <View style={styles.missionFooter}>
                        <View style={styles.locationTag}>
                           <MapPin size={12} color={Theme.colors.textMuted} />
                           <Text style={styles.locationText}>{req.delivery_point || req.hospital?.city}</Text>
                        </View>
                        <Text style={styles.actionPrompt}>RESPOND NOW</Text>
                     </View>
                   </TouchableOpacity>
                 ))}
              </View>
           )}
        </View>

        {/* Testing / Admin Bypass (Only for Dev) */}
        <TouchableOpacity style={styles.devBtn} onPress={sendTestPush}>
           <Text style={styles.devBtnText}>Simulate Emergency Alert</Text>
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
  heroHeader: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  impactTitle: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
    marginBottom: 16,
  },
  impactCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginTop: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  missionCenter: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 1.5,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  missionList: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  missionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  unitBadge: {
    backgroundColor: 'rgba(255,45,85,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  unitText: {
    color: Theme.colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  actionPrompt: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  idleState: {
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.border,
  },
  idleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: 16,
  },
  idleSub: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  devBtn: {
    padding: 16,
    alignItems: 'center',
    opacity: 0.5,
  },
  devBtnText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textDecorationLine: 'underline',
  }
});
