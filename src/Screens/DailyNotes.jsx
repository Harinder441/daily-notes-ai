import React, { useState } from 'react';
import Home from '../components/DailyNotes/Home';
import AllNotes from '../components/DailyNotes/AllNotes';
import History from '../components/DailyNotes/History';
import Logout from '../components/DailyNotes/Logout';
import BottomNavBar from '../components/DailyNotes/BottomNavBar';

const DailyNotes = () => {
  const [currentTab, setCurrentTab] = useState('home');

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home />;
      case 'allNotes':
        return <AllNotes />;
      case 'history':
        return <History />;
      case 'logout':
        return <Logout />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      {renderContent()}
      <BottomNavBar currentTab={currentTab} onTabPress={setCurrentTab} />
    </>
  );
};

export default DailyNotes; 