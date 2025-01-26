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
    const { data: existingNote } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('note_date', noteDate)
      .single();

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
    return supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('note_date', noteDate)
      .single();
  }
}; 