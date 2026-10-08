import React from 'react';
import { Printer, X, Download, FileText, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { JournalData, TOTAL_WEEKS } from '../types/journal';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalData: JournalData;
}

export function PrintReportModal({ isOpen, onClose, journalData }: PrintReportModalProps) {
  if (!isOpen) return null;

  const allWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
  
  let completedCount = 0;
  Object.values(journalData.weeks).forEach(w => {
    if (w.status === 'completed') completedCount++;
  });

  const driveItemsCount = journalData.items.filter(it => it.type === 'drive' || Boolean(it.driveUrl)).length;
  const progressPercent = Math.round((completedCount / TOTAL_WEEKS) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Resmi Gelişim Karnesi &amp; Öğretmen İnceleme Raporu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDF olarak kaydedilebilir veya doğrudan yazdırılabilir dokümantasyon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div id="printable-report-canvas" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:text-black">
          {/* Document Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-blue-700">
                  T.C. MİLLİ EĞİTİM &amp; BİLİŞİM GELİŞİM TAKİP SİSTEMİ
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                  38 Haftalık Bilişim ve Kodlama Süreç Karnesi
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Öğrenci: <strong className="text-slate-900 font-bold">Alperen Genç</strong> · 2025-2026 Akademik Dönemi
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono">
                <div>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
                <div className="font-bold text-slate-800 mt-0.5">Süreç: 38 Hafta Tam</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary Box */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Toplam Hafta</span>
              <span className="text-lg font-black text-slate-900">{TOTAL_WEEKS}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Tamamlanan</span>
              <span className="text-lg font-black text-emerald-600">{completedCount}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Kayıtlı Proje</span>
              <span className="text-lg font-black text-blue-600">{journalData.items.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Drive Dokümanı</span>
              <span className="text-lg font-black text-indigo-600">{driveItemsCount}</span>
            </div>
          </div>

          {/* Weekly Ledger Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                <th className="p-2 border border-slate-300 w-16 text-center">Hafta</th>
                <th className="p-2 border border-slate-300">Yapılan Çalışmalar / Proje Başlığı</th>
                <th className="p-2 border border-slate-300 w-28 text-center">Drive Linki</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {allWeeks.map(weekNum => {
                const items = (journalData.items || []).filter(it => Number(it.weekNumber) === Number(weekNum));
                const weekMeta = journalData.weeks[weekNum] || { status: 'not_started' };
                const isCompleted = weekMeta.status === 'completed';
                const driveLink = items.find(it => it.type === 'drive' || it.driveUrl)?.driveUrl;

                return (
                  <tr key={weekNum} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center font-bold font-mono">
                      {weekNum}. H
                    </td>
                    <td className="p-2 border border-slate-300">
                      {items.length === 0 ? (
                        <span className="text-slate-400 italic">Kayıt bulunmuyor</span>
                      ) : (
                        <div className="space-y-1">
                          {items.map(it => (
                            <div key={it.id}>
                              <span className="font-bold text-slate-800">{it.title}</span>
                              {it.content && (
                                <p className="text-[11px] text-slate-600 line-clamp-1">{it.content}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono text-[10px]">
                      {driveLink ? (
                        <span className="text-blue-700 font-bold">Mevcut (Drive)</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      {isCompleted ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                          Tamamlandı
                        </span>
                      ) : items.length > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                          Devam Ediyor
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Beklemede</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Teacher / Evaluator Evaluation & Signatures */}
          <div className="border border-slate-300 p-4 rounded-xl mt-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              Öğretmen &amp; Değerlendirici Notu ve Onayı
            </h4>
            <div className="h-16 border-b border-dashed border-slate-300 mb-4" />
            <div className="flex justify-between items-end text-xs text-slate-600 pt-2">
              <div>
                <span>Değerlendiren Öğretmen: .......................................</span>
              </div>
              <div>
                <span>İmza / Tarih: .........................</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
