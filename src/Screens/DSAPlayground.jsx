import React, { useState,useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, View, Button } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { QuestionCard } from '../components/QuestionCard';
import { Pagination } from '../components/Pagination';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/userContext';
export default function DSAPlayground() {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const { user, signOut } = useUser();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchQuestionsAndSolutions = async () => {
      const [questionsResponse, solutionsResponse] = await Promise.all([
        supabase.from('dsa_question').select('*').order('created_at', { ascending: true }),
        supabase.from('user_solutions').select('*').eq('user_id', user.id)
      ]);

      if (questionsResponse.error) {
        console.error('Error fetching questions:', questionsResponse.error);
        return;
      }

      if (solutionsResponse.error) {
        console.error('Error fetching solutions:', solutionsResponse.error);
        return;
      }

      const questionsWithSolutions = questionsResponse.data.map(question => ({
        ...question,
        userSolution: solutionsResponse.data.find(solution => solution.question_id === question.id) || null
      }));

      setQuestions(questionsWithSolutions);
      setFilteredQuestions(questionsWithSolutions);
    };

    fetchQuestionsAndSolutions();
  }, [user.id]);

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
    const { data: existingSolution } = await supabase
      .from('user_solutions')
      .select('*')
      .eq('question_id', question.id)
      .eq('user_id', user.id)
      .single();

    let error;
    if (existingSolution) {
      const { error: updateError } = await supabase
        .from('user_solutions')
        .update({
          is_solved: true,
          solved_date: date
        })
        .eq('question_id', question.id)
        .eq('user_id', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_solutions')
        .insert({
          user_id: user.id,
          question_id: question.id,
          is_solved: true,
          solved_date: date
        });
      error = insertError;
    }

    if (error) {
      console.error('Error updating solution:', error);
    } else {
      setFilteredQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === question.id
            ? {
                ...q,
                userSolution: {
                  question_id: question.id,
                  user_id: user.id,
                  is_solved: true,
                  solved_date: date
                }
              }
            : q
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>DSA Questions Collection</Text>
      <Button title="Sign Out" onPress={signOut} />
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
