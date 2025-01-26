import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Switch, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/userContext';
import { supabase } from '../../lib/supabase';
import { notionService } from '../../services/notionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const { user, signOut } = useUser();
  const [notionEnabled, setNotionEnabled] = useState(false);
  const [notionPageId, setNotionPageId] = useState('');
  const [notionApiKey, setNotionApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    loadNotionSettings();
  }, []);

  const loadNotionSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(`notion_enabled_${user.id}`) || 'true';
      const pageId = await AsyncStorage.getItem(`notion_page_id_${user.id}`) || '187fe0e227b480038676e0d600dfad88';
      const apiKey = await AsyncStorage.getItem(`notion_api_key_${user.id}`) || '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';
      
      setNotionEnabled(enabled === 'true');
      setNotionPageId(pageId || '');
      setNotionApiKey(apiKey || '');

      if (apiKey && pageId) {
        notionService.initialize(apiKey);
        try {
          const title = await notionService.getPageTitle(pageId);
          setPageTitle(title);
        } catch (error) {
          console.error('Error loading page title:', error);
        }
      }
    } catch (error) {
      console.error('Error loading Notion settings:', error);
    }
  };

  const saveNotionSettings = async () => {
    try {
      await AsyncStorage.setItem(`notion_enabled_${user.id}`, notionEnabled.toString());
      await AsyncStorage.setItem(`notion_page_id_${user.id}`, notionPageId);
      await AsyncStorage.setItem(`notion_api_key_${user.id}`, notionApiKey);
    } catch (error) {
      console.error('Error saving Notion settings:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotionSync = async () => {
    if (!notionPageId || !notionApiKey) {
      Alert.alert('Error', 'Please enter both Notion API key and page ID');
      return;
    }

    setIsSyncing(true);
    try {
      notionService.initialize(notionApiKey);

      // Validate page access
      const hasAccess = await notionService.validatePageAccess(notionPageId);
      if (!hasAccess) {
        Alert.alert('Error', 'Invalid page ID or insufficient permissions');
        return;
      }

      // Fetch unsynchronized notes
      const { data: notes, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_notion_synced', false)
        .order('note_date', { ascending: true });

      if (error) throw error;

      if (notes.length === 0) {
        Alert.alert('Info', 'No new notes to sync');
        return;
      }

      // Sync to Notion
      await notionService.appendToPage(notionPageId, notes);

      // Mark notes as synced
      const updates = notes.map(note => ({
        id: note.id,
        is_notion_synced: true
      }));

      const { error: updateError } = await supabase
        .from('daily_notes')
        .upsert(updates);

      if (updateError) throw updateError;

      Alert.alert('Success', `Synced ${notes.length} notes to Notion`);
      await saveNotionSettings();
    } catch (error) {
      console.error('Error syncing to Notion:', error);
      Alert.alert('Error', 'Failed to sync with Notion. Please check your API key and page ID.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notion Sync</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notion Sync</Text>
          <Switch
            value={notionEnabled}
            onValueChange={setNotionEnabled}
          />
        </View>
        {notionEnabled && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter Notion API Key"
              value={notionApiKey}
              onChangeText={setNotionApiKey}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Notion Page ID"
              value={notionPageId}
              onChangeText={setNotionPageId}
            />
            {pageTitle && (
              <Text style={styles.pageTitle}>Page: {pageTitle}</Text>
            )}
            <TouchableOpacity 
              style={styles.syncButton}
              onPress={handleNotionSync}
              disabled={isSyncing}
            >
              <MaterialIcons name="sync" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {isSyncing ? 'Syncing...' : 'Sync to Notion'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  pageTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
});

export default Settings; 