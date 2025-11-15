import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../src/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  profile_picture_url: string | null;
  credits_balance: number;
  earned_balance: number;
  vitrine_slug: string | null;
}

export const useUserProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, profile_picture_url, credits_balance, earned_balance, vitrine_slug')
          .eq('id', authUser.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Set up realtime subscription for profile changes
    const channel = supabase
      .channel(`profile:${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${authUser.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  return { profile, loading };
};
