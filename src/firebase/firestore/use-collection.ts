'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, getDocs, Query, DocumentData, FirestoreError, QuerySnapshot, collectionGroup } from 'firebase/firestore';

interface UseCollectionOptions {
  listen?: boolean;
}

export function useCollection<T>(
  query: Query<DocumentData> | null,
  options: UseCollectionOptions = { listen: true }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const refresh = async () => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(query);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      setData(docs);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    if (!options.listen) {
      refresh();
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(query, 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setLoading(false);
        setError(null);
      }, 
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        console.error(err);
      }
    );

    return () => unsubscribe();

  }, [JSON.stringify(query)]);

  return { data, loading, error, refresh };
}
