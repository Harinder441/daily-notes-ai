import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, currentPage === 1 && styles.disabled]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={styles.pageBtnText}>Previous</Text>
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        <Text style={styles.pageText}>{`Page ${currentPage} of ${totalPages}`}</Text>
      </View>

      <TouchableOpacity
        style={[styles.pageBtn, currentPage === totalPages && styles.disabled]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={styles.pageBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pageBtn: {
    padding: 8,
    backgroundColor: '#1565c0',
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: 'white',
  },
  pageNumbers: {
    marginHorizontal: 16,
  },
  pageText: {
    color: '#1565c0',
  },
}); 