import { supabase } from './supabase';

const envUrl = process.env.REACT_APP_SUPABASE_URL?.trim() || '';
const envKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY?.trim() || '';

export function getSupabaseEnvInfo() {
  return {
    url: envUrl,
    keyLoaded: !!envKey,
    missing: !envUrl || !envKey,
    missingFields: [
      !envUrl ? 'REACT_APP_SUPABASE_URL' : null,
      !envKey ? 'REACT_APP_SUPABASE_PUBLISHABLE_KEY' : null,
    ].filter(Boolean),
  };
}

export async function testAuth() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    return {
      success: !sessionError && !userError,
      session: sessionData?.session ?? null,
      user: userData?.user ?? null,
      error: sessionError?.message || userError?.message || null,
    };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function testConnection() {
  if (!envUrl || !envKey) {
    return {
      success: false,
      error:
        'Supabase client configuration is missing. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY in your .env file.',
      env: getSupabaseEnvInfo(),
    };
  }

  try {
    const { data, error } = await supabase.from('donors').select('id').limit(1);

    if (error) {
      return {
        success: false,
        error: error.message || 'Query failed while testing connection.',
        details: { table: 'donors', error },
      };
    }

    return { success: true, rowCount: data?.length ?? 0 };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function fetchAllTables() {
  const tables = {
    donors: [],
    hospitals: [],
    requests: [],
    errors: [],
  };

  const queries = [
    { name: 'donors', query: supabase.from('donors').select('*') },
    { name: 'hospitals', query: supabase.from('hospitals').select('*') },
    { name: 'requests', query: supabase.from('blood_requests').select('*') },
  ];

  await Promise.all(
    queries.map(async ({ name, query }) => {
      const { data, error } = await query;
      if (error) {
        tables.errors.push({ table: name, message: error.message || String(error) });
      } else {
        tables[name] = data || [];
      }
    })
  );

  return tables;
}

export function subscribeToRealtime() {
  const channels = [];

  const donorChannel = supabase
    .channel('donors_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, payload => {
      console.log('👥 Donor change:', payload.eventType, payload.new || payload.old);
    })
    .subscribe();

  const requestChannel = supabase
    .channel('requests_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, payload => {
      console.log('🩸 Request change:', payload.eventType, payload.new || payload.old);
    })
    .subscribe();

  const responseChannel = supabase
    .channel('responses_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'donor_responses' }, payload => {
      console.log('📨 Response change:', payload.eventType, payload.new || payload.old);
    })
    .subscribe();

  channels.push(donorChannel, requestChannel, responseChannel);
  console.log('✅ Realtime listeners active');

  return () => {
    channels.forEach(ch => supabase.removeChannel(ch));
    console.log('📴 Realtime listeners removed');
  };
}
