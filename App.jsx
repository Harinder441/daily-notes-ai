import React from 'react';
import { View } from 'react-native';
import DSAPlayground from './src/Screens/DSAPlayground';
import Login from './src/Screens/Login';
import DailyNotes from './src/Screens/DailyNotes';
import { UserProvider, useUser } from './src/context/userContext';
import { StatusBar } from 'expo-status-bar';
function AppContent() {
  const { session, initialized } = useUser();

  if (!initialized) {
    return null; // Or a loading spinner
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      {session ? <DailyNotes /> : <Login />}
    </View>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
