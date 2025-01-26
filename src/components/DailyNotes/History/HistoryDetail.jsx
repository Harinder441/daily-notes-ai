import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HistoryDetail = ({ historyItem, onBack, onApply }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.dateText}>
            {new Date(historyItem.noteDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.timeText}>
            {new Date(historyItem.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={onApply}
        >
          <MaterialIcons name="restore" size={24} color="#0066cc" />
          <Text style={styles.applyText}>Restore</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.content}>
          {historyItem.content || 'No content for this version'}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 8,
  },
  applyText: {
    color: '#0066cc',
    marginLeft: 4,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default HistoryDetail; 