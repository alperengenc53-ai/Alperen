import { JournalData, WeekItem, ProjectUpdate, createInitialJournalData } from '../types/journal';

// Built-in initial items that are compiled directly into the application
export const INITIAL_JOURNAL_ITEMS: WeekItem[] = [
  {
    id: "item_initial_week1_drive",
    weekNumber: 1,
    type: "drive",
    title: "Proje 1",
    content: "Google Drive bağlantısı",
    driveUrl: "https://drive.google.com/drive/my-drive?hl=tr",
    createdAt: "2026-09-28T20:07:25.615Z",
    formattedDate: "28.09.2026 – 23:07"
  }
];

// Pre-seeded updates showcasing the recent milestones
export const INITIAL_UPDATES: ProjectUpdate[] = [
  {
    id: "update_seeded_4",
    title: "Canlı Arama Motoru & Drive Projeleri Vitrini",
    content: "Tüm 38 hafta içinde hızlı arama yapan filtreleme çubuğu ve Google Drive dosyaları vitrini yayına alındı.",
    tag: "Geliştirme",
    createdAt: "2026-10-02T18:00:00.000Z",
    formattedDate: "02.10.2026 – 21:00"
  },
  {
    id: "update_seeded_3",
    title: "4 Dönemlik Çizelge & Resmi Karne Raporu (PDF)",
    content: "38 haftalık süreç 4 çeyreğe ayrıldı ve öğretmen değerlendirme imzalı resmi gelişim karnesi PDF şablonu eklendi.",
    tag: "Duyuru",
    createdAt: "2026-10-02T15:30:00.000Z",
    formattedDate: "02.10.2026 – 18:30"
  },
  {
    id: "update_seeded_2",
    title: "Kullanıcı Kayıt & Haftalık Yorum Sistemi",
    content: "Ziyaretçiler için e-posta ve şifreyle hızlı hesap oluşturma, haftalık yorumlar ve canlı beğeni (kalp) eklendi.",
    tag: "Proje",
    createdAt: "2026-10-02T10:00:00.000Z",
    formattedDate: "02.10.2026 – 13:00"
  },
  {
    id: "update_seeded_1",
    title: "38 Haftalık Müfredat & Takvim Mimarisi",
    content: "Gelişim günlüğü 38 haftaya yükseltildi, canlı Türkiye saati ve akademik takvim banner'ı entegre edildi.",
    tag: "Geliştirme",
    createdAt: "2026-10-01T14:00:00.000Z",
    formattedDate: "01.10.2026 – 17:00"
  }
];

export function getInitialSeedData(): JournalData {
  const base = createInitialJournalData();
  base.items = [...INITIAL_JOURNAL_ITEMS];
  base.updates = [...INITIAL_UPDATES];
  
  // Set week status according to initial items
  INITIAL_JOURNAL_ITEMS.forEach(it => {
    if (base.weeks[it.weekNumber]) {
      base.weeks[it.weekNumber].status = 'in_progress';
    }
  });

  return base;
}
