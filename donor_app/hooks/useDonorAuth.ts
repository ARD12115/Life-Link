import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

export function useDonorAuth() {
  const [user, setUser] = useState<any>(null);
  const [donor, setDonor] = useState<any>(null);
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
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (data) setDonor(data);
    return { data, error };
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
    if (!user) return { error: 'No authenticated user' };

    // 1. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        role: 'donor',
        display_name: name,
        phone: phone
      });

    if (profileError) return { error: profileError };

    // 2. Create Donor Record
    const { data: donorData, error: donorError } = await supabase
      .from('donors')
      .insert({
        user_id: user.id,
        name,
        blood_group: bloodGroup,
        city,
        phone
      })
      .select()
      .single();

    if (donorData) setDonor(donorData);
    return { data: donorData, error: donorError };
  }

  return { user, donor, loading, signInAnonymously, completeOnboarding, fetchDonorProfile };
}
