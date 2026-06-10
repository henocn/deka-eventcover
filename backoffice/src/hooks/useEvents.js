import { useContext } from 'react';
import { EventsContext } from '../contexts/EventsContext';

function useEvents() {
  const value = useContext(EventsContext);
  if (!value) throw new Error('useEvents must be used inside EventsProvider');
  return value;
}

export default useEvents;
