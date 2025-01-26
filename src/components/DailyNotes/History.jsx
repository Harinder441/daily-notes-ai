import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { notesService } from '../../services/notesService';
import { useUser } from '../../context/userContext';
import { useNoteSync } from '../../hooks/useNoteSync';
import HistoryList from './History/HistoryList';
import HistoryDetail from './History/HistoryDetail';

const History = () => {
  const { user } = useUser();
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const { notes, setNotes, syncWithServer, getTodayKey } = useNoteSync(user.id, true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await notesService.getHistory();
    setHistory(historyData);
  };

  const handleApplyHistory = async () => {
    Alert.alert(
      'Restore Note',
      'Are you sure you want to restore this version? Current version will be added to history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              // Save current version to history
              await notesService.addToHistory({
                content: notes,
                noteDate: getTodayKey(),
                timestamp: new Date().toISOString(),
                userId: user.id,
              });

              // Update current note with history version
              setNotes(selectedHistory.content);
              await syncWithServer(selectedHistory.content, new Date().toISOString());
              
              // Refresh history list
              loadHistory();
              
              // Go back to list view
              setSelectedHistory(null);
            } catch (error) {
              console.error('Error restoring history:', error);
              Alert.alert('Error', 'Failed to restore note version');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {selectedHistory ? (
        <HistoryDetail 
          historyItem={selectedHistory}
          onBack={() => setSelectedHistory(null)}
          onApply={handleApplyHistory}
        />
      ) : (
        <HistoryList 
          history={history}
          onHistorySelect={setSelectedHistory}
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

export default History; 