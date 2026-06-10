import { Navigate, Route, Routes } from 'react-router-dom';
import ParticipantEventPage from './pages/ParticipantEventPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ParticipantEventPage />} />
      <Route path="/events/:eventSlug" element={<ParticipantEventPage />} />
      <Route path="/events/:eventSlug/albums/:albumSlug" element={<ParticipantEventPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
