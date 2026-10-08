import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JournalData, WeekItem, WeekComment, ProjectUpdate, WeekStatus, createInitialJournalData } from '../types/journal';
import { INITIAL_JOURNAL_ITEMS, INITIAL_UPDATES } from '../data/seedData';

const CACHE_KEY = 'alperen_genc_journal_cache_v3';

// Read local cache for instant zero-latency loading
export function getLocalData(): JournalData {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.weeks && Array.isArray(parsed.items)) {
        if (!parsed.updates || parsed.updates.length === 0) {
          parsed.updates = [...INITIAL_UPDATES];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }

  const base = createInitialJournalData();
  base.items = [...INITIAL_JOURNAL_ITEMS];
  base.updates = [...INITIAL_UPDATES];
  INITIAL_JOURNAL_ITEMS.forEach(it => {
    if (base.weeks[it.weekNumber]) {
      base.weeks[it.weekNumber].status = 'in_progress';
    }
  });
  return base;
}

export function saveLocalData(data: JournalData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

/**
 * Loads current journal state from Firestore.
 * If empty in Firestore, automatically seeds with initial items so the user's
 * Week 1 Drive link is instantly in Firestore for all devices to read!
 */
export async function loadJournalData(): Promise<JournalData> {
  const local = getLocalData();

  try {
    const itemsCol = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsCol);

    const weeksCol = collection(db, 'weeks');
    const weeksSnapshot = await getDocs(weeksCol);

    const baseData = createInitialJournalData();

    if (itemsSnapshot.empty) {
      // First time initialization: seed Firestore with Week 1 Drive link
      for (const item of INITIAL_JOURNAL_ITEMS) {
        await setDoc(doc(db, 'items', item.id), item);
      }
      baseData.items = [...INITIAL_JOURNAL_ITEMS];
      baseData.weeks[1].status = 'in_progress';
      await setDoc(doc(db, 'weeks', '1'), { weekNumber: 1, status: 'in_progress' });
      saveLocalData(baseData);
      return baseData;
    }

    const items: WeekItem[] = [];
    itemsSnapshot.forEach(docSnap => {
      items.push(docSnap.data() as WeekItem);
    });

    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply week status from Firestore
    weeksSnapshot.forEach(docSnap => {
      const wData = docSnap.data();
      const wNum = Number(wData.weekNumber);
      if (baseData.weeks[wNum]) {
        baseData.weeks[wNum] = {
          ...baseData.weeks[wNum],
          status: wData.status || baseData.weeks[wNum].status,
          customTitle: wData.customTitle,
        };
      }
    });

    // Make sure weeks with items are marked at least in_progress if not_started
    items.forEach(it => {
      if (baseData.weeks[it.weekNumber] && baseData.weeks[it.weekNumber].status === 'not_started') {
        baseData.weeks[it.weekNumber].status = 'in_progress';
      }
    });

    baseData.items = items;
    
    // Sync updates & comments from server json
    try {
      const sRes = await fetch('/api/journal');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (Array.isArray(sData.updates)) {
          baseData.updates = sData.updates;
        }
        if (Array.isArray(sData.comments) && sData.comments.length > 0) {
          baseData.comments = sData.comments;
        }
      }
    } catch {
      // offline or local
    }

    if (!baseData.updates || baseData.updates.length === 0) {
      baseData.updates = [...INITIAL_UPDATES];
    }

    saveLocalData(baseData);
    return baseData;
  } catch (err) {
    console.warn('Firestore fetch failed, using local/seed cache:', err);
    // Even if Firestore fails, try fetching server data
    try {
      const sRes = await fetch('/api/journal');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.weeks) {
          saveLocalData(sData);
          return sData;
        }
      }
    } catch {
      // ignore
    }
    return local;
  }
}

/**
 * Real-time listener: Whenever any device (phone, teacher's PC, etc.) adds,
 * edits, or deletes an item, this callback immediately receives the updated state!
 */
export function subscribeToJournal(onUpdate: (data: JournalData) => void): Unsubscribe {
  const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));

  return onSnapshot(itemsQuery, snapshot => {
    const current = getLocalData();
    const items: WeekItem[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as WeekItem);
    });

    const nextWeeks = { ...current.weeks };
    items.forEach(it => {
      if (nextWeeks[it.weekNumber] && nextWeeks[it.weekNumber].status === 'not_started') {
        nextWeeks[it.weekNumber] = {
          ...nextWeeks[it.weekNumber],
          status: 'in_progress',
        };
      }
    });

    const updated: JournalData = {
      ...current,
      items,
      weeks: nextWeeks,
    };
    saveLocalData(updated);
    onUpdate(updated);
  }, error => {
    console.warn('Real-time subscription error:', error);
  });
}

/**
 * Creates an item in Cloud Firestore.
 * Available instantly to any phone, PC, or browser!
 */
export async function createItem(payload: {
  weekNumber: number;
  type: 'post' | 'drive';
  title: string;
  content: string;
  driveUrl?: string;
  formattedDate: string;
}): Promise<WeekItem> {
  const newItemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newItem: WeekItem = {
    id: newItemId,
    weekNumber: Number(payload.weekNumber),
    type: payload.type,
    title: payload.title.trim(),
    content: payload.content.trim(),
    driveUrl: payload.driveUrl ? payload.driveUrl.trim() : undefined,
    createdAt: new Date().toISOString(),
    formattedDate: payload.formattedDate,
  };

  // 1. Write to Firestore cloud
  try {
    await setDoc(doc(db, 'items', newItemId), newItem);
    // Mark week status as in_progress in Firestore
    await setDoc(
      doc(db, 'weeks', String(newItem.weekNumber)),
      { weekNumber: newItem.weekNumber, status: 'in_progress' },
      { merge: true }
    );
  } catch (err) {
    console.error('Firestore write error:', err);
  }

  // 2. Optimistic local cache update
  const current = getLocalData();
  const nextItems = [newItem, ...current.items.filter(i => i.id !== newItem.id)];
  const nextWeeks = { ...current.weeks };
  if (nextWeeks[newItem.weekNumber] && nextWeeks[newItem.weekNumber].status === 'not_started') {
    nextWeeks[newItem.weekNumber] = {
      ...nextWeeks[newItem.weekNumber],
      status: 'in_progress',
    };
  }
  saveLocalData({ ...current, items: nextItems, weeks: nextWeeks });

  // 3. Mirror to server database so AI and server endpoints have all items immediately
  try {
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
  } catch {
    // ignore
  }

  return newItem;
}

/**
 * Updates an item in Cloud Firestore
 */
export async function updateItem(
  id: string,
  payload: { title?: string; content?: string; driveUrl?: string }
): Promise<void> {
  const current = getLocalData();
  const nextItems = current.items.map(it =>
    it.id === id
      ? {
          ...it,
          title: payload.title !== undefined ? payload.title.trim() : it.title,
          content: payload.content !== undefined ? payload.content.trim() : it.content,
          driveUrl: payload.driveUrl !== undefined ? payload.driveUrl.trim() : it.driveUrl,
          updatedAt: new Date().toISOString(),
        }
      : it
  );
  saveLocalData({ ...current, items: nextItems });

  try {
    await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }

  try {
    const itemRef = doc(db, 'items', id);
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (payload.title !== undefined) updatePayload.title = payload.title.trim();
    if (payload.content !== undefined) updatePayload.content = payload.content.trim();
    if (payload.driveUrl !== undefined) updatePayload.driveUrl = payload.driveUrl.trim();

    await setDoc(itemRef, updatePayload, { merge: true });
  } catch (err) {
    console.error('Firestore update error:', err);
  }
}

/**
 * Deletes an item from Cloud Firestore
 */
export async function deleteItem(id: string): Promise<void> {
  const current = getLocalData();
  const itemToDelete = current.items.find(it => it.id === id);
  const nextItems = current.items.filter(it => it.id !== id);
  const nextWeeks = { ...current.weeks };

  if (itemToDelete) {
    const remainingInWeek = nextItems.filter(it => it.weekNumber === itemToDelete.weekNumber);
    if (remainingInWeek.length === 0 && nextWeeks[itemToDelete.weekNumber]?.status === 'in_progress') {
      nextWeeks[itemToDelete.weekNumber] = {
        ...nextWeeks[itemToDelete.weekNumber],
        status: 'not_started',
      };
    }
  }

  saveLocalData({ ...current, items: nextItems, weeks: nextWeeks });

  try {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
  } catch {
    // ignore
  }

  try {
    await deleteDoc(doc(db, 'items', id));
  } catch (err) {
    console.error('Firestore delete error:', err);
  }
}

/**
 * Updates week status (completed / in_progress / not_started) in Cloud Firestore
 */
export async function updateWeekMeta(
  weekNumber: number,
  payload: { status?: WeekStatus; customTitle?: string }
): Promise<void> {
  const current = getLocalData();
  const nextWeeks = {
    ...current.weeks,
    [weekNumber]: {
      ...current.weeks[weekNumber],
      weekNumber,
      status: payload.status || current.weeks[weekNumber]?.status || 'not_started',
      customTitle: payload.customTitle !== undefined ? payload.customTitle : current.weeks[weekNumber]?.customTitle,
    },
  };
  saveLocalData({ ...current, weeks: nextWeeks });

  try {
    await fetch(`/api/weeks/${weekNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }

  try {
    await setDoc(
      doc(db, 'weeks', String(weekNumber)),
      {
        weekNumber,
        status: payload.status,
        ...(payload.customTitle !== undefined ? { customTitle: payload.customTitle } : {}),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Firestore week update error:', err);
  }
}

export async function importJournalData(data: JournalData): Promise<void> {
  saveLocalData(data);
  try {
    for (const item of data.items) {
      await setDoc(doc(db, 'items', item.id), item);
    }
    for (const week of Object.values(data.weeks)) {
      await setDoc(doc(db, 'weeks', String(week.weekNumber)), week);
    }
  } catch (err) {
    console.error('Firestore bulk import error:', err);
  }
}

/**
 * Adds a new comment to local cache and server
 */
export async function addComment(payload: {
  weekNumber: number;
  authorName: string;
  content: string;
}): Promise<WeekComment> {
  const newComment: WeekComment = {
    id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    weekNumber: Number(payload.weekNumber),
    authorName: payload.authorName.trim(),
    content: payload.content.trim(),
    createdAt: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const current = getLocalData();
  const nextComments = [newComment, ...(current.comments || [])];
  saveLocalData({ ...current, comments: nextComments });

  try {
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    });
  } catch (err) {
    console.warn('Could not post comment to server:', err);
  }

  return newComment;
}

/**
 * Deletes a comment
 */
export async function deleteComment(id: string): Promise<void> {
  const current = getLocalData();
  const nextComments = (current.comments || []).filter(c => c.id !== id);
  saveLocalData({ ...current, comments: nextComments });

  try {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Could not delete comment on server:', err);
  }
}

/**
 * Adds a new daily/project update (Changelog/Yenilik)
 */
export async function addProjectUpdate(payload: {
  title: string;
  content: string;
  tag?: string;
}): Promise<ProjectUpdate> {
  const newUpdate: ProjectUpdate = {
    id: 'upd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: (payload.title || 'Günlük Yenilik').trim(),
    content: payload.content.trim(),
    tag: payload.tag || 'Geliştirme',
    createdAt: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const current = getLocalData();
  const nextUpdates = [newUpdate, ...(current.updates || [])];
  saveLocalData({ ...current, updates: nextUpdates });

  try {
    await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUpdate),
    });
  } catch (err) {
    console.warn('Could not post update to server:', err);
  }

  return newUpdate;
}

/**
 * Deletes a project update
 */
export async function deleteProjectUpdate(id: string): Promise<void> {
  const current = getLocalData();
  const nextUpdates = (current.updates || []).filter(u => u.id !== id);
  saveLocalData({ ...current, updates: nextUpdates });

  try {
    await fetch(`/api/updates/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Could not delete update on server:', err);
  }
}

const LIKED_WEEKS_KEY = 'alperen_genc_liked_weeks_v1';

export function getLikedWeeks(): number[] {
  try {
    const raw = localStorage.getItem(LIKED_WEEKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isWeekLiked(weekNumber: number): boolean {
  const list = getLikedWeeks();
  return list.includes(Number(weekNumber));
}

/**
 * Toggles like for a week (likes if not liked, unlikes if already liked)
 */
export async function toggleLikeWeek(weekNumber: number): Promise<{ likes: number; isLiked: boolean }> {
  const current = getLocalData();
  const currentLikes = Number(current.likes?.[weekNumber] || current.weeks[weekNumber]?.likes || 0);
  const currentlyLiked = isWeekLiked(weekNumber);

  const newIsLiked = !currentlyLiked;
  const newLikes = newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  // Update liked weeks list in localStorage
  try {
    const list = getLikedWeeks().filter(w => w !== Number(weekNumber));
    if (newIsLiked) list.push(Number(weekNumber));
    localStorage.setItem(LIKED_WEEKS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }

  const nextLikes = {
    ...(current.likes || {}),
    [weekNumber]: newLikes,
  };

  const nextWeeks = {
    ...current.weeks,
    [weekNumber]: {
      ...(current.weeks[weekNumber] || { weekNumber, status: 'not_started' }),
      likes: newLikes,
    },
  };

  saveLocalData({
    ...current,
    weeks: nextWeeks,
    likes: nextLikes,
  });

  try {
    const res = await fetch(`/api/weeks/${weekNumber}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: newIsLiked ? 'like' : 'unlike' }),
    });
    if (res.ok) {
      const data = await res.json();
      return { likes: data.likes, isLiked: newIsLiked };
    }
  } catch (err) {
    console.warn('Could not post like to server:', err);
  }

  return { likes: newLikes, isLiked: newIsLiked };
}

// Backward-compatible alias
export async function likeWeek(weekNumber: number): Promise<number> {
  const res = await toggleLikeWeek(weekNumber);
  return res.likes;
}




