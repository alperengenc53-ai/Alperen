export type WeekStatus = 'not_started' | 'in_progress' | 'completed';

export interface WeekItem {
  id: string;
  weekNumber: number; // 1 to 38
  type: 'post' | 'drive';
  title: string;
  content: string; // Long text for post, or description for drive link
  driveUrl?: string; // Validated Google Drive URL
  createdAt: string; // ISO date string
  formattedDate: string; // e.g. "28.09.2026 – 19:30"
  updatedAt?: string;
}

export interface WeekComment {
  id: string;
  weekNumber: number; // 1 to 38
  authorName: string;
  content: string;
  createdAt: string;
  formattedDate: string; // e.g. "28.09.2026 – 19:35"
}

export interface ProjectUpdate {
  id: string;
  title: string; // e.g. "Bugün şunu ekledim"
  content: string;
  tag?: string; // e.g. "Geliştirme", "Duyuru", "Düzeltme"
  createdAt: string;
  formattedDate: string; // e.g. "01.10.2026 – 17:55"
}

export interface WeekMeta {
  weekNumber: number;
  customTitle?: string;
  status: WeekStatus;
  likes?: number;
}

export interface JournalData {
  weeks: Record<number, WeekMeta>;
  items: WeekItem[];
  comments: WeekComment[];
  updates: ProjectUpdate[];
  likes: Record<number, number>; // weekNumber -> like count
}

export const TOTAL_WEEKS = 38;

export function createInitialJournalData(): JournalData {
  const weeks: Record<number, WeekMeta> = {};
  const likes: Record<number, number> = {};
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    weeks[i] = {
      weekNumber: i,
      status: 'not_started',
      likes: 0,
    };
    likes[i] = 0;
  }
  return {
    weeks,
    items: [],
    comments: [],
    updates: [
      {
        id: 'upd_initial_1',
        title: 'Gelişim Günlüğü Yayında',
        content: '38 haftalık proje süreci haritası, Drive bağlantıları ve ziyaretçi etkileşim özellikleri aktif edildi.',
        tag: 'Duyuru',
        createdAt: new Date().toISOString(),
        formattedDate: '01.10.2026 – 18:00',
      },
    ],
    likes,
  };
}
