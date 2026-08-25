import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import type { Tables, TablesInsert } from '../types/supabase';

type Profile = Tables<'profiles'>
type Donor = Tables<'donors'>
type DonorInsert = TablesInsert<'donors'>
type ProfileInsert = TablesInsert<'profiles'>

export function useDonorAuth() {
  const [user, setUser] = useState<any>(null); // Supabase User type
  const [donor, setDonor] = useState<Donor | null>(null);
  const [role, setRole] = useState<Profile['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchDonorProfile(session.user.id);
      } else {
        setUser(null);
        setDonor(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchDonorProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDonorProfile(userId: string) {
    const [{ data: donorData }, { data: profileData }] = await Promise.all([
      supabase.from('donors').select('*').eq('user_id', userId).single(),
      supabase.from('profiles').select('role').eq('user_id', userId).single()
    ]);
      
    if (donorData) setDonor(donorData);
    if (profileData) setRole(profileData.role);
    return { donorData, profileData };
  }

  async function signInAnonymously() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      setLoading(false);
      return { error };
    }
    return { data };
  }

  async function completeOnboarding(name: string, bloodGroup: string, city: string, phone: string) {
    // Get current session to avoid stale closure
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('Onboarding blocked: No authenticated user');
      return { error: 'No authenticated user' };
    }
    const userId = session.user.id;

    try {
      // 1. Create Profile (Atomic check)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          role: 'donor',
          display_name: name,
          phone: phone
        });

      if (profileError) {
        if (profileError.code === '23505') return { error: 'Profile already exists' };
        return { error: profileError.message };
      }

      // 2. Create Donor Record
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .insert({
          user_id: userId,
          name,
          blood_group: bloodGroup,
          city,
          phone,
          available: true
        })
        .select()
        .single();

      if (donorData) setDonor(donorData);
      return { data: donorData, error: donorError?.message };
    } catch (e) {
      return { error: 'A system error occurred. Please try again.' };
    }
  }

  return { user, donor, role, loading, signInAnonymously, completeOnboarding, fetchDonorProfile };
}
