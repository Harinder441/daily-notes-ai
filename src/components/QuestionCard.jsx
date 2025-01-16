import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const WebDatePicker = ({ value, onChange }) => {
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <input
      type="date"
      value={value ? formatDateForInput(value) : ''}
      onChange={(e) => {
        onChange({ type: 'set', nativeEvent: { timestamp: new Date(e.target.value) }});
      }}
      style={{
        padding: 8,
        borderRadius: 5,
        border: '1px solid #ddd',
        fontSize: 14,
      }}
    />
  );
};

export const QuestionCard = ({ questionData, index, onDateUpdate }) => {
  const question = questionData.data;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const date = selectedDate || (event.nativeEvent?.timestamp ? new Date(event.nativeEvent.timestamp) : null);
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      onDateUpdate(questionData, date.toISOString());
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const DatePickerComponent = Platform.select({
    web: WebDatePicker,
    default: DateTimePicker,
  });

  return (
    <View style={styles.questionItem}>
      <View style={styles.serialNumber}>
        <Text style={styles.serialNumberText}>{index}</Text>
      </View>
      <View style={styles.questionContent}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <View style={[styles.difficulty, styles[question.difficulty]]}>
            <Text style={styles.difficultyText}>{question.difficulty}</Text>
          </View>
          <View style={styles.solveContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.dateButton}>
                <DatePickerComponent
                  value={question.solved_date ? new Date(question.solved_date) : null}
                  onChange={handleDateChange}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dateButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {question.solved_date ? formatDate(question.solved_date) : 'Add date'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.solveBtn, question.solved && styles.solved]}
              onPress={() => Linking.openURL(question.link)}
            >
              <Text style={styles.solveBtnText}>
                {question.solved ? 'Solved' : 'Solve →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          <View style={styles.tags}>
            {question.companyTags?.slice(0, 5).map((tag, i) => (
              <View key={i} style={[styles.tag, styles.companyTag]}>
                <Text style={styles.companyTagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.tags}>
            {question.topicTags?.slice(0, 5).map((tag, i) => (
              <View key={i} style={[styles.tag, styles.topicTag]}>
                <Text style={styles.topicTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {showDatePicker && Platform.OS !== 'web' && (
          <DatePickerComponent
            value={question.solved_date ? new Date(question.solved_date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  serialNumber: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serialNumberText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  questionContent: {
    flex: 1,
    marginLeft: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  questionTitle: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  difficulty: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  difficultyText: {
    fontSize: 12,
  },
  Easy: {
    backgroundColor: '#e8f5e9',
  },
  Medium: {
    backgroundColor: '#fff3e0',
  },
  Hard: {
    backgroundColor: '#ffebee',
  },
  solveBtn: {
    padding: 8,
    backgroundColor: '#1565c0',
    borderRadius: 5,
  },
  solved: {
    backgroundColor: '#4caf50',
  },
  solveBtnText: {
    color: 'white',
    fontSize: 14,
  },
  tagsContainer: {
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    padding: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  companyTag: {
    backgroundColor: '#e3f2fd',
  },
  topicTag: {
    backgroundColor: '#f3e5f5',
  },
  companyTagText: {
    color: '#1565c0',
    fontSize: 12,
  },
  topicTagText: {
    color: '#6a1b9a',
    fontSize: 12,
  },
  solveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    minWidth: 80,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 