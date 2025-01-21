import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/userContext';
import NetInfo from '@react-native-community/netinfo';

const DailyNotes = () => {
  const [notes, setNotes] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useUser();

  // Get today's date as key
  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        syncWithServer(); // Sync when coming back online
      }
    });

    return () => unsubscribe();
  }, []);

  // Modify the real-time subscription setup
  useEffect(() => {
    loadNotes();
    
    // Set up real-time subscription for changes
    const subscription = supabase
      .channel('daily_notes_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'daily_notes',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Only update if the change is from another session and for today's note
          if (payload.new.note_date === getTodayKey()) {
            const serverTimestamp = new Date(payload.new.updated_at);
            const localLastEdit = await AsyncStorage.getItem(`last_edit_${getTodayKey()}`);
            
            // Update if server version is newer or if no local edit timestamp exists
            if (!localLastEdit || serverTimestamp > new Date(localLastEdit)) {
              setNotes(payload.new.content);
              await AsyncStorage.setItem(`notes_${getTodayKey()}`, payload.new.content);
              await AsyncStorage.setItem(`last_edit_${getTodayKey()}`, payload.new.updated_at);
              setLastSyncTime(serverTimestamp);
            }
          }
        }
      )
      .subscribe();

    // Set up periodic fetch for updates
    // const fetchInterval = setInterval(async () => {
    //   if (isOnline) {
    //     try {
    //       const todayKey = getTodayKey();
    //       const { data, error } = await supabase
    //         .from('daily_notes')
    //         .select('*')
    //         .eq('user_id', user.id)
    //         .eq('note_date', todayKey)
    //         .single();
    //         console.log('Fetching notes:', data);
    //       if (error) {
    //         if (error.code !== 'PGRST116') { // Not found error
    //           console.error('Error fetching notes:', error);
    //         }
    //         return;
    //       }

    //       if (data) {
    //         const serverTimestamp = new Date(data.updated_at);
    //         const localLastEdit = await AsyncStorage.getItem(`last_edit_${getTodayKey()}`);

    //         // Update if server version is newer
    //         if (!localLastEdit || serverTimestamp > new Date(localLastEdit)) {
    //           console.log('Fetched newer version from server');
    //           setNotes(data.content);
    //           await AsyncStorage.setItem(`notes_${getTodayKey()}`, data.content);
    //           await AsyncStorage.setItem(`last_edit_${getTodayKey()}`, data.updated_at);
    //           setLastSyncTime(serverTimestamp);
    //         }
    //       }
    //     } catch (error) {
    //       console.error('Error in periodic fetch:', error);
    //     }
    //   }
    // }, 2000); // Check for updates every 2 seconds

    return () => {
      subscription.unsubscribe();
    //   clearInterval(fetchInterval);
    };
  }, [isOnline, user.id]);

  const handleServerUpdate = async (serverNote) => {
    const localLastEdit = await AsyncStorage.getItem(`last_edit_${getTodayKey()}`);
    
    if (!localLastEdit || new Date(serverNote.updated_at) > new Date(localLastEdit)) {
      setNotes(serverNote.content);
      await AsyncStorage.setItem(`notes_${getTodayKey()}`, serverNote.content);
      await AsyncStorage.setItem(`last_edit_${getTodayKey()}`, serverNote.updated_at);
    }
  };

  const loadNotes = async () => {
    try {
      const todayKey = getTodayKey();
      
      // Load from local storage first
      const savedNotes = await AsyncStorage.getItem(`notes_${todayKey}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }

      // Then try to fetch from server
      if (isOnline) {
        const { data, error } = await supabase
          .from('daily_notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('note_date', todayKey)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching notes:', error);
          }
        } else if (data) {
          const localLastEdit = await AsyncStorage.getItem(`last_edit_${todayKey}`);
          
          // Use server version if it's newer
          if (!localLastEdit || new Date(data.updated_at) > new Date(localLastEdit)) {
            setNotes(data.content);
            await AsyncStorage.setItem(`notes_${todayKey}`, data.content);
            await AsyncStorage.setItem(`last_edit_${todayKey}`, data.updated_at);
          }
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Add periodic sync
  useEffect(() => {

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        syncWithServer();
      }
    }, 2000); // Sync every 2 seconds if there are unsaved changes

    return () => {
      clearInterval(syncInterval);
    };
  }, [isOnline, hasUnsavedChanges]);

  // Modify handleTextChange to track local changes better
  const handleTextChange = (text) => {
    const timestamp = new Date().toISOString();
    setNotes(text);
    setHasUnsavedChanges(true);
    // Update local last edit time immediately
    AsyncStorage.setItem(`last_edit_${getTodayKey()}`, timestamp);
    debouncedSave(text);
  };

  // Update saveNotes to include the current timestamp
  const saveNotes = async (text) => {
    try {
      setSaving(true);
      const todayKey = getTodayKey();
      const timestamp = new Date().toISOString();

      // Save locally
      await AsyncStorage.setItem(`notes_${todayKey}`, text);
      await AsyncStorage.setItem(`last_edit_${getTodayKey()}`, timestamp);

      // Sync with server if online
      if (isOnline) {
        await syncWithServer(text, timestamp);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((text) => saveNotes(text), 1500),
    [isOnline]
  );

  // Update syncWithServer to use provided timestamp
  const syncWithServer = async (text, timestamp) => {
    if (!isOnline) return;

    try {
      const todayKey = getTodayKey();
      
      if (hasUnsavedChanges) {
        setSaving(true);
      }

      const { data: existingNote } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_date', todayKey)
        .single();

      if (existingNote) {
        const { error } = await supabase
          .from('daily_notes')
          .update({
            content: text,
            updated_at: timestamp
          })
          .eq('user_id', user.id)
          .eq('note_date', todayKey);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_notes')
          .insert({
            user_id: user.id,
            note_date: todayKey,
            content: text,
            updated_at: timestamp
          });

        if (error) throw error;
      }

      setLastSyncTime(new Date(timestamp));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error syncing with server:', error);
    } finally {
      if (hasUnsavedChanges) {
        setSaving(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when back online</Text>
        </View>
      )}
      <TextInput
        style={styles.textInput}
        multiline
        value={notes}
        onChangeText={handleTextChange}
        placeholder="Start writing your notes for today..."
        textAlignVertical="top"
        autoFocus
      />
      {isSaving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#0066cc" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  textInput: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  savingIndicator: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 10,
  },
  offlineBanner: {
    backgroundColor: '#ffeb3b',
    padding: 5,
    alignItems: 'center',
  },
  offlineText: {
    color: '#666',
    fontSize: 12,
  },
});

export default DailyNotes; 