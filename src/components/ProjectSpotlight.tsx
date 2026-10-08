import React from 'react';
import { ExternalLink, Link2, FileText, ChevronRight, FolderArchive, Sparkles } from 'lucide-react';
import { JournalData, WeekItem } from '../types/journal';

interface ProjectSpotlightProps {
  journalData: JournalData;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModal: () => void;
}

export function ProjectSpotlight({ journalData, onSelectWeek, onOpenAddModal }: ProjectSpotlightProps) {
  // Find all items that have a drive link or are marked as drive projects
  const driveItems = (journalData.items || [])
    .filter(item => item.type === 'drive' || Boolean(item.driveUrl))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (driveItems.length === 0) return null;

  return (
    <section className="py-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-600 text-white shadow-2xs">
              <FolderArchive className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                Öne Çıkan Drive Belgeleri &amp; Proje Kaynakları
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Alperen Genç tarafından sisteme yüklenen doğrudan incelenebilir proje dosyaları
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            {driveItems.length} Proje Dokümanı
          </span>
        </div>

        {/* Horizontal Scrollable or Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {driveItems.slice(0, 6).map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <button
                    onClick={() => onSelectWeek(item.weekNumber)}
                    className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    {item.weekNumber}. Hafta Projesi
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.formattedDate}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                  {item.content}
                </p>
              </div>

              {/* Bottom Direct Drive Link */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectWeek(item.weekNumber)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Haftayı Aç</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                {item.driveUrl && (
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Drive Dosyası</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
