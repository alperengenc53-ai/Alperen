import { CheckCircle2, Clock, CalendarDays, TrendingUp, Link2, MessageSquare, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { JournalData, TOTAL_WEEKS } from '../types/journal';

interface OverviewProps {
  journalData: JournalData;
}

export function Overview({ journalData }: OverviewProps) {
  const weeksWithItemsCount = new Set(journalData.items.map(item => item.weekNumber)).size;
  
  let completedWeeksCount = 0;
  Object.values(journalData.weeks).forEach(w => {
    if (w.status === 'completed') completedWeeksCount++;
  });

  const driveItemsCount = journalData.items.filter(it => it.type === 'drive' || it.driveUrl).length;
  
  const totalLikes = Object.values(journalData.likes || {}).reduce((acc, v) => acc + (Number(v) || 0), 0) +
    Object.values(journalData.weeks).reduce((acc, w) => acc + (w.likes || 0), 0);

  const totalComments = (journalData.comments || []).length;

  const progressPercent = Math.round((completedWeeksCount / TOTAL_WEEKS) * 100);

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 sm:py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Subtle Welcome & Project Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50/80 dark:from-slate-850 dark:via-blue-950/20 dark:to-slate-850 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                Gelişim Portfolyosu
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Alperen Genç · Bilişim &amp; Yazılım
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              38 Haftalık Proje ve Öğretmen İnceleme Günlüğü
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Bu platformda haftalık olarak geliştirilen yazılım projeleri, Google Drive kaynak dosyaları ve süreç değerlendirmeleri düzenli olarak arşivlenmektedir.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href="#week-detail-section"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>Aktif Haftayı İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#all-weeks-record-section"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-750 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <span>38 Haftalık Liste</span>
            </a>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Toplam Süreç & Hafta */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Planlanan Süreç
              </span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {TOTAL_WEEKS} <span className="text-xs font-normal text-slate-400">Hafta</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dönemlik gelişim takvimi
              </p>
            </div>
          </div>

          {/* Card 2: Kayıtlı Projeler & Drive */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Çalışmalar &amp; Drive
              </span>
              <Link2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {journalData.items.length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">kayıt</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {driveItemsCount} Google Drive bağlantısı
              </p>
            </div>
          </div>

          {/* Card 3: Tamamlanan / Onaylı */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Onaylanan Hafta
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {completedWeeksCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {TOTAL_WEEKS}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {weeksWithItemsCount} haftada içerik var
              </p>
            </div>
          </div>

          {/* Card 4: İlerleme & Etkileşim */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Genel İlerleme
              </span>
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  %{progressPercent}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> {totalLikes} · <MessageSquare className="w-3 h-3 text-blue-500 inline" /> {totalComments}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
