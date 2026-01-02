import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode } from '@/lib/forgeUtils';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  payment_status: 'CONFIRMED_15K' | 'BALANCE_PAID';
  unlock_level: 'PREVIEW' | 'FULL';
  forge_mode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  edition_id: string | null;
  city: string | null;
  kyf_completed: boolean;
  profile_setup_completed: boolean;
  ky_form_completed: boolean;
  bio: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  specialty: string | null;
}

interface Edition {
  id: string;
  forge_start_date: string | null;
  forge_end_date: string | null;
  cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  edition: Edition | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isFullAccess: boolean;
  isDuringForge: boolean;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEdition = async (editionId: string) => {
    const { data, error } = await supabase
      .from('editions')
      .select('id, forge_start_date, forge_end_date, cohort_type')
      .eq('id', editionId)
      .single();
    
    if (error) {
      console.error('Error fetching edition:', error);
      return null;
    }
    return data as Edition;
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const fetchUserData = async (userId: string) => {
    const profileData = await fetchProfile(userId);
    setProfile(profileData);
    
    if (profileData?.edition_id) {
      const editionData = await fetchEdition(profileData.edition_id);
      setEdition(editionData);
    } else {
      setEdition(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setEdition(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setEdition(null);
  };

  const isFullAccess = profile?.unlock_level === 'FULL';
  const forgeMode = calculateForgeMode(edition?.forge_start_date, edition?.forge_end_date);
  const isDuringForge = forgeMode === 'DURING_FORGE';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      edition,
      loading,
      signIn,
      signOut,
      refreshProfile,
      isFullAccess,
      isDuringForge,
      forgeMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
