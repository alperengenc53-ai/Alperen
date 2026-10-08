import { useState } from 'react';
import {
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleDot,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { JournalData, TOTAL_WEEKS, WeekStatus } from '../types/journal';
import { useAuth } from '../context/AuthContext';

interface WeekGridProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onUpdateWeekStatus?: (weekNum: number, status: WeekStatus) => Promise<void>;
  onOpenAddModalForWeek?: (weekNum: number) => void;
}

export function WeekGrid({
  journalData,
  selectedWeek,
  onSelectWeek,
  onUpdateWeekStatus,
}: WeekGridProps) {
  const { isAdmin, openLoginModal } = useAuth();
  
  // User asked: "Haftalar için kare bi kutucuk üstüne basınca o kutucuk büyüsün ve 1 den 38. haftaya kadar buton olcak 1 den 38. haftaya istediğine basınca o haftadaki yere atıcak kolaylık olsun diye"
  const [isOpen, setIsOpen] = useState(false);

  const getWeekItems = (weekNum: number) => {
    return (journalData.items || [])
      .filter(item => Number(item.weekNumber) === Number(weekNum));
  };

  const getWeekStatus = (weekNum: number): WeekStatus => {
    return journalData.weeks[weekNum]?.status || 'not_started';
  };

  const allWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const handleSelect = (weekNum: number) => {
    onSelectWeek(weekNum);
    // Smooth jump to the week detail section for maximum convenience
    const el = document.getElementById('week-detail-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, weekNum: number) => {
    e.stopPropagation();
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    if (!onUpdateWeekStatus) return;
    const current = getWeekStatus(weekNum);
    const next: WeekStatus = current === 'completed' ? 'not_started' : 'completed';
    onUpdateWeekStatus(weekNum, next);
  };

  const selectedItems = getWeekItems(selectedWeek);
  const selectedStatus = getWeekStatus(selectedWeek);

  return (
    <section id="weeks-top-grid-section" className="py-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kare Kutucuk (Basınca büyüyen modül) */}
        <div className="bg-white dark:bg-slate-850 border-2 border-blue-500/40 dark:border-blue-500/50 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          {/* Kare Kutucuk Başlığı - Tıklandığında Büyür */}
          <div
            onClick={() => setIsOpen(prev => !prev)}
            className="p-3.5 sm:p-4.5 flex items-center justify-between cursor-pointer hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-colors select-none group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    Haftalık Süreç Haritası
                  </span>
                  <span className="text-xs font-bold text-slate-500">1 - 38 Hafta</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {isOpen ? 'Hafta Seçim Tablosu (Açık)' : `Seçili: ${selectedWeek}. Hafta (Değiştirmek İçin Kutucuğa Basın)`}
                </h3>
              </div>
            </div>

            {/* Sağ taraf durum ve Aç/Kapa simgesi */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>{selectedWeek}. Hafta</span>
                {selectedStatus === 'completed' ? (
                  <span className="text-emerald-600 flex items-center gap-0.5 text-[11px]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Yapıldı
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    {selectedItems.length > 0 ? `${selectedItems.length} Dosya` : 'Boş'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs group-hover:bg-blue-700 transition-colors">
                <span>{isOpen ? 'Kutuyu Küçült' : 'Kutuyu Büyüt & Hafta Seç'}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
              </div>
            </div>
          </div>

          {/* Büyüyen Kısım: 1'den 38'e kadar Butonlar Listesi */}
          {isOpen && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Aşağıdaki butonlardan dilediğiniz haftaya tıklayarak o haftaya hemen gidebilirsiniz:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">1'den 38'e kadar</span>
              </div>

              {/* 1'den 38'e Butonlar Izgarası */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-13 gap-2">
                {allWeeks.map(weekNum => {
                  const items = getWeekItems(weekNum);
                  const status = getWeekStatus(weekNum);
                  const isSelected = selectedWeek === weekNum;
                  const isCompleted = status === 'completed';

                  return (
                    <button
                      key={weekNum}
                      type="button"
                      onClick={() => handleSelect(weekNum)}
                      title={`${weekNum}. Hafta (${isCompleted ? 'Yapıldı' : items.length > 0 ? `${items.length} kayıt` : 'Boş'})`}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/40 scale-105 z-10'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 shadow-xs'
                          : items.length > 0
                          ? 'bg-blue-100 dark:bg-blue-950/70 hover:bg-blue-200 text-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-800 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-950 dark:text-slate-100 shadow-xs'
                      }`}
                    >
                      {/* Küçük Hafta Başlığı */}
                      <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        Hafta
                      </span>

                      {/* Hafta Numarası - Tam belirgin font */}
                      <span className={`text-base sm:text-xl font-black tabular-nums leading-tight my-0.5 ${isSelected ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
                        {weekNum}
                      </span>

                      {/* Küçük Durum İpucu */}
                      <div className="flex items-center gap-0.5 text-[9px] font-extrabold mt-0.5">
                        {isCompleted ? (
                          <span className={isSelected ? 'text-white' : 'text-emerald-700 dark:text-emerald-400 flex items-center'}>
                            <Check className="w-2.5 h-2.5 stroke-[3] mr-0.5" /> Yapıldı
                          </span>
                        ) : items.length > 0 ? (
                          <span className={isSelected ? 'text-blue-100' : 'text-blue-700 dark:text-blue-400'}>
                            {items.length} dosya
                          </span>
                        ) : (
                          <span className={isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}>Boş</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
