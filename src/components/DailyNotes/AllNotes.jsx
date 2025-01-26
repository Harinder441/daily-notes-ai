import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/userContext';
import NotesList from './AllNotes/NotesList';
import NoteDetail from './AllNotes/NoteDetail';

const AllNotes = () => {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('note_date', { ascending: false });

      if (error) throw error;
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {selectedNote ? (
        <NoteDetail 
          note={selectedNote} 
          onBack={() => setSelectedNote(null)} 
        />
      ) : (
        <NotesList 
          notes={notes} 
          onNoteSelect={setSelectedNote} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AllNotes; 