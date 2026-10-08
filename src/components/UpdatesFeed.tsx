import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, ShieldCheck, Tag, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectUpdate } from '../types/journal';
import { useAuth } from '../context/AuthContext';

interface UpdatesFeedProps {
  updates: ProjectUpdate[];
  onAddUpdate: (payload: { title: string; content: string; tag?: string }) => Promise<void>;
  onDeleteUpdate: (id: string) => Promise<void>;
}

export function UpdatesFeed({ updates, onAddUpdate, onDeleteUpdate }: UpdatesFeedProps) {
  const { isAdmin, openLoginModal } = useAuth();
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Geliştirme');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddUpdate({
        title: title.trim() || 'Günlük Yenilik',
        content: content.trim(),
        tag,
      });
      setTitle('');
      setContent('');
      setIsOpenForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Softer eye-friendly tag styling (no glaring tones)
  const tagColors: Record<string, string> = {
    Geliştirme: 'bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
    Duyuru: 'bg-amber-100/70 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    Düzeltme: 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    Proje: 'bg-purple-100/70 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
  };

  const latestUpdate = updates.length > 0 ? updates[0] : null;

  return (
    <section className="py-2.5 bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Soft, eye-pleasing slate container (no stark white) */}
        <div className="bg-slate-200/60 dark:bg-slate-800/70 border border-slate-300/70 dark:border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-2xs">
          {/* Compact Header Bar */}
          <div className="flex items-center justify-between gap-2.5">
            <div
              onClick={() => setIsCollapsed(prev => !prev)}
              className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
            >
              <div className="p-1 rounded-md bg-blue-600 text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 truncate">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tracking-tight shrink-0">
                  Günlükler &amp; Yenilikler
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-400/30 shrink-0">
                  {updates.length}
                </span>

                {/* Single line teaser when collapsed or on wide screens */}
                {latestUpdate && (
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate hidden md:inline">
                    • <strong className="text-slate-800 dark:text-slate-200 font-semibold">{latestUpdate.title}:</strong> {latestUpdate.content}
                  </span>
                )}
              </div>
            </div>

            {/* Right Buttons: Admin Add + Minimize */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin ? (
                <button
                  onClick={() => {
                    setIsOpenForm(prev => !prev);
                    if (isCollapsed) setIsCollapsed(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isOpenForm ? 'İptal' : 'Yenilik Ekle'}</span>
                </button>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
                  title="Yenilik eklemek için yönetici girişi yapın"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={() => setIsCollapsed(prev => !prev)}
                className="p-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title={isCollapsed ? 'Genişlet' : 'Küçült'}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  {isCollapsed ? 'Genişlet' : 'Küçült'}
                </span>
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isCollapsed && (
            <div className="mt-2 pt-2 border-t border-slate-300/60 dark:border-slate-700/60">
              {/* Form for Admin */}
              {isOpenForm && isAdmin && (
                <form
                  onSubmit={handleSubmit}
                  className="mb-2.5 p-2.5 bg-slate-100 dark:bg-slate-750 rounded-lg border border-blue-300 dark:border-blue-900 shadow-2xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Başlık (Örn: Bugün şu özelliği bitirdim)"
                        className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <select
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option value="Geliştirme">Geliştirme</option>
                        <option value="Duyuru">Duyuru</option>
                        <option value="Düzeltme">Düzeltme</option>
                        <option value="Proje">Proje</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <textarea
                      rows={1}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Bugün yapılan çalışmaların detayları..."
                      required
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsOpenForm(false)}
                      className="px-2.5 py-1 rounded-md border border-slate-300 text-[11px] text-slate-500 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !content.trim()}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Yayınla'}
                    </button>
                  </div>
                </form>
              )}

              {/* Ultra-compact Cards List: Soft eye-pleasing tinted cards, NO stark white */}
              {updates.length === 0 ? (
                <div className="py-1 text-center text-xs text-slate-500 dark:text-slate-400 italic">
                  Henüz bir yenilik kaydı girilmedi.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto pr-1">
                  {updates.map(upd => (
                    <div
                      key={upd.id}
                      className="bg-blue-50/70 dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-flex items-center gap-0.5 ${
                              tagColors[upd.tag || 'Geliştirme'] || tagColors['Geliştirme']
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{upd.tag || 'Geliştirme'}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              {upd.formattedDate}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => onDeleteUpdate(upd.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                                title="Yeniliği sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {upd.title}
                        </h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 mt-0.5">
                          {upd.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
