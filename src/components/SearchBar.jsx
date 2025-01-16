import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export const SearchBar = ({ onSearch }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search questions by title, company, or topic..."
        onChangeText={onSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  searchInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    fontSize: 16,
  },
}); 