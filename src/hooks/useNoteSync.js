import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { notesService } from '../services/notesService';

export const useNoteSync = (userId, isOnline) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const syncWithServer = async (text, timestamp) => {
    if (!isOnline) return;

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
    debounce((text) => saveNotes(text), 1500),
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
    getTodayKey
  };
}; 