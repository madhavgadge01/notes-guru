import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SingleDeviceAlertModal from './components/common/SingleDeviceAlertModal';
import HelpSupportWidget from './components/common/HelpSupportWidget';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import AcademicExplorePage from './pages/AcademicExplorePage';
import SubjectListingPage from './pages/SubjectListingPage';
import SubjectDetailsPage from './pages/SubjectDetailsPage';
import BlockUnitsPage from './pages/BlockUnitsPage';
import NotesReaderPage from './pages/NotesReaderPage';
import LibraryPage from './pages/LibraryPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';

const AppContent = () => {
  const { sessionAlertMessage, clearSessionAlert } = useAuth();
  const location = useLocation();

  // Hide main footer on dedicated distraction-free reader screen
  const isReaderPage = location.pathname.startsWith('/reader/');

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EF] dark:bg-[#171717] text-[#242321] dark:text-gray-100 font-sans transition-colors">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/available-subjects" element={<SubjectListingPage />} />
          <Route path="/explore" element={<AcademicExplorePage />} />
          <Route path="/academic" element={<AcademicExplorePage />} />
          <Route path="/semester/:semesterId" element={<SubjectListingPage />} />
          <Route path="/subject/:id" element={<SubjectDetailsPage />} />
          <Route path="/block/:blockId" element={<BlockUnitsPage />} />
          <Route path="/reader/:noteId" element={<NotesReaderPage />} />
          <Route path="/my-notes" element={<LibraryPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      {!isReaderPage && <Footer />}

      {/* Website-Wide Help & Support Floating Widget (Hidden on Reader & Fullscreen) */}
      <HelpSupportWidget />

      {/* Global Single-Device Login Alert Modal */}
      <SingleDeviceAlertModal
        message={sessionAlertMessage}
        onClose={clearSessionAlert}
      />
    </div>
  );
};

function App() {
  return <AppContent />;
}

export default App;
