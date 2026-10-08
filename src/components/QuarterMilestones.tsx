import React from 'react';
import { BookOpen, Code2, Rocket, Award, ChevronRight, CheckCircle2 } from 'lucide-react';
import { JournalData } from '../types/journal';

interface QuarterMilestonesProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
}

interface QuarterConfig {
  id: number;
  title: string;
  subtitle: string;
  startWeek: number;
  endWeek: number;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
}

const QUARTERS: QuarterConfig[] = [
  {
    id: 1,
    title: '1. Çeyrek',
    subtitle: 'Temel Yapılar & Giriş',
    startWeek: 1,
    endWeek: 10,
    icon: BookOpen,
    accentColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
  },
  {
    id: 2,
    title: '2. Çeyrek',
    subtitle: 'Ara Projeler & Geliştirme',
    startWeek: 11,
    endWeek: 19,
    icon: Code2,
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
  },
  {
    id: 3,
    title: '3. Çeyrek',
    subtitle: 'İleri Düzey Uygulamalar',
    startWeek: 20,
    endWeek: 29,
    icon: Rocket,
    accentColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
  },
  {
    id: 4,
    title: '4. Çeyrek',
    subtitle: 'Final & Bitirme Projeleri',
    startWeek: 30,
    endWeek: 38,
    icon: Award,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  },
];

export function QuarterMilestones({ journalData, selectedWeek, onSelectWeek }: QuarterMilestonesProps) {
  return (
    <section className="py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dönemlik Çizelge
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              4 Akademik Aşama (38 Hafta)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Aşamalara tıklayarak o haftalara doğrudan geçebilirsiniz
          </span>
        </div>

        {/* 4 Quarter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUARTERS.map(q => {
            const Icon = q.icon;
            const totalInQuarter = q.endWeek - q.startWeek + 1;
            
            // Calculate completed weeks in this quarter
            let completedInQuarter = 0;
            let itemsInQuarter = 0;
            for (let w = q.startWeek; w <= q.endWeek; w++) {
              if (journalData.weeks[w]?.status === 'completed') completedInQuarter++;
              const count = (journalData.items || []).filter(it => Number(it.weekNumber) === w).length;
              itemsInQuarter += count;
            }

            const percent = Math.round((completedInQuarter / totalInQuarter) * 100);
            const isCurrentInQuarter = selectedWeek >= q.startWeek && selectedWeek <= q.endWeek;

            return (
              <div
                key={q.id}
                onClick={() => onSelectWeek(q.startWeek)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none group flex flex-col justify-between ${
                  isCurrentInQuarter
                    ? 'bg-blue-50/60 dark:bg-slate-800/90 border-blue-500 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/15'
                    : 'bg-slate-50/70 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${q.badgeBg}`}>
                      {q.title} ({q.startWeek}–{q.endWeek}. Hafta)
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${q.accentColor}`} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {q.subtitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {completedInQuarter}/{totalInQuarter} hafta onaylandı · {itemsInQuarter} kayıt
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>İlerleme</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">%{percent}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
