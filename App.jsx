import React from 'react';
import { View } from 'react-native';
import DSAPlayground from './src/screens/DSAPlayground';
import Login from './src/screens/Login';
import { UserProvider, useUser } from './src/context/userContext';

function AppContent() {
  const { session, initialized } = useUser();

  if (!initialized) {
    return null; // Or a loading spinner
  }

  return (
    <View style={{ flex: 1 }}>
      {session ? <DSAPlayground /> : <Login />}
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
