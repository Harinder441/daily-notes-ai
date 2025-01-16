import React, { useState,useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { QuestionCard } from '../components/QuestionCard';
import { Pagination } from '../components/Pagination';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';

export default function DSAPlayground() {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('dsa_question').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setQuestions(data);
        setFilteredQuestions(data);
      }
    };
    fetchQuestions();
  }, []);

  const filterQuestions = (searchTerm) => {
    const filtered = questions.filter(question => {
      const searchString = searchTerm.toLowerCase();
      return (
        question.data.title?.toLowerCase().includes(searchString) ||
        question.data.companyTags?.some(tag => tag.toLowerCase().includes(searchString)) ||
        question.data.topicTags?.some(tag => tag.toLowerCase().includes(searchString))
      );
    });
    setFilteredQuestions(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const questionsToShow = filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDateUpdate = async (question, date) => {
    const { data, error } = await supabase
      .from('dsa_question')
      .update({data:{ 
        ...question.data,
        solved: true,
        solved_date: date 
      }})
      .eq('id', question.id);

    if (error) {
      console.error('Error updating question:', error);
    } else {
      console.log('Question updated successfully');
      // Update the local state
      setFilteredQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === question.id
            ? { ...q, data:{
              ...q.data,
              solved: true,
              solved_date: date 
            }}
            : q
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>DSA Questions Collection</Text>
      
      <SearchBar onSearch={filterQuestions} />
      
      <ScrollView style={styles.questionsList}>
        {questionsToShow.map((question, index) => (
          <QuestionCard
            key={index}
            questionData={question}
            index={startIndex + index + 1}
            onDateUpdate={handleDateUpdate}
          />
        ))}
      </ScrollView>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginVertical: 20,
  },
  questionsList: {
    flex: 1,
  },
});
