import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { notesService } from '../services/notesService';

export const useNoteSync = (userId, isOnline) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isFetching, setIsFetching] = useState(false);


  const getTodayKey = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsFetching(true);
        const todayKey = getTodayKey();
        console.log('todayKey', todayKey);
        const { content: localNote, lastEdit } = await notesService.getFromLocal(todayKey);
        console.log('localNote', localNote);
        // If online, try to fetch from server
        if (isOnline) {
          const serverNote = await notesService.fetchFromServer(userId, todayKey);
          console.log('serverNote', serverNote);
          if (serverNote) {
            const serverTimestamp = new Date(serverNote.updated_at);
            const localTimestamp = lastEdit ? new Date(lastEdit) : null;
            
            // Use server data if it's newer and has more content
            if ((!localTimestamp || serverTimestamp > localTimestamp) && 
                serverNote.content?.length > (localNote?.length || 0)) {
              notesService.addToHistory({
                content: localNote,
                noteDate: todayKey,
                timestamp: lastEdit,
                userId: userId,
              });
              setNotes(serverNote.content);
              await notesService.saveToLocal(todayKey, serverNote.content, serverNote.updated_at);
              return;
            }
          }
        }
        
        // If offline or server data isn't newer/better, use local data
        setNotes(localNote || '');
      } catch (error) {
        console.error('Error fetching notes:', error);
        // Fallback to empty string if both fetches fail
        setNotes('');
      } finally {
        setIsFetching(false);
      }
    };

    fetchNotes();
  }, [isOnline, userId]);

  const syncWithServer = async (text, timestamp) => {
    if (!isOnline) return;
    console.log('syncWithServer', text, timestamp);
    try {
      const todayKey = getTodayKey();
      if (hasUnsavedChanges) setSaving(true);

      await notesService.saveToServer(userId, todayKey, text, timestamp);

      setLastSyncTime(new Date(timestamp));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error syncing with server:', error);
    } finally {
      if (hasUnsavedChanges) setSaving(false);
    }
  };

  const saveNotes = async (text) => {
    try {
      setSaving(true);
      const todayKey = getTodayKey();
      const timestamp = new Date().toISOString();

      await notesService.saveToLocal(todayKey, text, timestamp);

      if (isOnline) {
        await syncWithServer(text, timestamp);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((text) => saveNotes(text), 1500, { leading: false, trailing: true }),
    [isOnline]
  );

  const handleTextChange = (text) => {
    const timestamp = new Date().toISOString();
    setNotes(text);
    setHasUnsavedChanges(true);
    notesService.saveToLocal(getTodayKey(), text, timestamp);
    debouncedSave(text);
  };

  return {
    notes,
    setNotes,
    isSaving,
    hasUnsavedChanges,
    lastSyncTime,
    handleTextChange,
    syncWithServer,
    getTodayKey,
    isFetching
  };
}; 