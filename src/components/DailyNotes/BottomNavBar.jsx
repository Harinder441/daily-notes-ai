import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BottomNavBar = ({ currentTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('home')}
      >
        <MaterialIcons 
          name="edit" 
          size={24} 
          color={currentTab === 'home' ? '#0066cc' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentTab === 'home' && styles.activeTabText
        ]}>Today</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('allNotes')}
      >
        <MaterialIcons 
          name="notes" 
          size={24} 
          color={currentTab === 'allNotes' ? '#0066cc' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentTab === 'allNotes' && styles.activeTabText
        ]}>All Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('history')}
      >
        <MaterialIcons 
          name="history" 
          size={24} 
          color={currentTab === 'history' ? '#0066cc' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentTab === 'history' && styles.activeTabText
        ]}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('settings')}
      >
        <MaterialIcons 
          name="settings" 
          size={24} 
          color={currentTab === 'settings' ? '#0066cc' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentTab === 'settings' && styles.activeTabText
        ]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: '500',
  },
});

export default BottomNavBar; 