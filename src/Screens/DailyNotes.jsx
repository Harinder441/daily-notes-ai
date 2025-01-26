import React, { useEffect, useState } from 'react';
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
import { useNoteSync } from '../hooks/useNoteSync';
import { notesService } from '../services/notesService';

const DailyNotes = () => {
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  
  const {
    notes,
    setNotes,
    isSaving,
    hasUnsavedChanges,
    handleTextChange,
    syncWithServer,
    getTodayKey
  } = useNoteSync(user.id, isOnline);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected && hasUnsavedChanges) {
        syncWithServer(notes, new Date().toISOString());
      }
    });

    return () => unsubscribe();
  }, [hasUnsavedChanges, notes]);

  // Real-time subscription setup
  useEffect(() => {
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
          if (payload.new.note_date === getTodayKey()) {
            const { lastEdit } = await notesService.getFromLocal(getTodayKey());
            const serverTimestamp = new Date(payload.new.updated_at);
            
            if ((!lastEdit || serverTimestamp > new Date(lastEdit)) && 
                payload.new.content?.length > notes?.length) {
              setNotes(payload.new.content);
              await notesService.saveToLocal(
                getTodayKey(),
                payload.new.content,
                payload.new.updated_at
              );
            }
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user.id]);

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