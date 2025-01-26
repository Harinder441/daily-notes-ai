import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const notesService = {
  async saveToLocal(key, content, timestamp) {
    await AsyncStorage.setItem(`notes_${key}`, content);
    await AsyncStorage.setItem(`last_edit_${key}`, timestamp);
  },

  async getFromLocal(key) {
    return {
      content: await AsyncStorage.getItem(`notes_${key}`),
      lastEdit: await AsyncStorage.getItem(`last_edit_${key}`)
    };
  },

  async saveToServer(userId, noteDate, content, timestamp) {
    console.log('userId', userId, 'noteDate', noteDate, 'content', content, 'timestamp', timestamp);
    const existingNote = await this.fetchFromServer(userId, noteDate);

    if (existingNote) {
      return supabase
        .from('daily_notes')
        .update({ content, updated_at: timestamp })
        .eq('user_id', userId)
        .eq('note_date', noteDate);
    }

    return supabase
      .from('daily_notes')
      .insert({
        user_id: userId,
        note_date: noteDate,
        content,
        updated_at: timestamp
      });
  },

  async fetchFromServer(userId, noteDate) {
    const { data: serverNotes, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('note_date', noteDate)
      .limit(1);
    const serverNote = serverNotes[0]??null;
    console.log('serverNotddde', serverNote);
    if(!error) {
      return serverNote;
    }
    return null;
  },
  
  async addToHistory(note) {
    try {
      const history = await this.getHistory() || [];
      
      // Add new note to the beginning of the array
      history.unshift(note);
      
      // Limit to 20 items
      const limitedHistory = history.slice(0, 20);
      
      await AsyncStorage.setItem('notes_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },

  async getHistory() {
    try {
      const history = await AsyncStorage.getItem('notes_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  async clearHistory() {
    try {
      await AsyncStorage.removeItem('notes_history');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
}; 