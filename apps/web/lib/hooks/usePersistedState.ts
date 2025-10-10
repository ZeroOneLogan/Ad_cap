import { useEffect, useState } from 'react';
import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'IdleTycoon',
  storeName: 'gameData',
  description: 'Idle Tycoon game data storage',
});

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => any;
    deserialize?: (value: any) => T;
  }
): [T, (value: T) => Promise<void>, boolean] {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  const serialize = options?.serialize || ((v) => v);
  const deserialize = options?.deserialize || ((v) => v);
  
  // Load initial value
  useEffect(() => {
    localforage
      .getItem(key)
      .then((stored) => {
        if (stored !== null) {
          setState(deserialize(stored));
        }
      })
      .catch((error) => {
        console.error(`Failed to load ${key}:`, error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key]);
  
  // Save function
  const save = async (value: T) => {
    setState(value);
    try {
      await localforage.setItem(key, serialize(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      throw error;
    }
  };
  
  return [state, save, isLoading];
}