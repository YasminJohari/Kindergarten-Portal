'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ActivityPost } from '@/types';
import {
  Camera,
  Send,
  Check,
} from 'lucide-react';

export const PostCreatorView: React.FC = () => {
  const { students, addPost, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityPost['category']>('Learning');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['std-1', 'std-2']);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80'
  );

  const presetImages = [
    { label: 'Eksperimen / STEAM', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Mewarna & Kraf', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80' },
    { label: 'Makan Berkhasiat', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80' },
    { label: 'Muzik & Gerakan', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80' },
  ];

  const categories: ActivityPost['category'][] = [
    'Learning',
    'Play & Creative',
    'Meals & Snack',
    'Nap & Rest',
    'Special Event',
  ];

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Sila masukkan tajuk dan huraian aktiviti!');
      return;
    }

    addPost({
      teacherId: 'tch-1',
      teacherName: 'Cikgu Sarah binti Mansor',
      teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      className: 'Tadika 5 Tahun - Class Little Stars',
      category,
      title: title.trim(),
      description: description.trim(),
      date: '28/09/2026',
      images: [selectedPresetImage],
      taggedStudentIds: selectedStudentIds,
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase mb-1">
          <Camera className="w-4 h-4" />
          <span>Borang Log Harian & Gambar Aktiviti</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Kongsi Detik Pembelajaran Kelas Hari Ini
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Foto dan catatan akan dipaparkan serta-merta pada suapan ibu bapa yang ditag.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Kategori Aktiviti:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tajuk Catatan Harian:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Eksplorasi Sains: Belajar Sifat Bahan Magnetik"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Huraian & Perkembangan Kanak-kanak:
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan aktiviti yang dijalankan, reaksi murid..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Pilih Gambar Aktiviti (Kamera Tadika):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetImages.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedPresetImage(img.url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video group ${
                    selectedPresetImage === img.url
                      ? 'border-sky-600 ring-2 ring-sky-600/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                    {img.label}
                  </span>
                  {selectedPresetImage === img.url && (
                    <span className="absolute top-1 right-1 bg-sky-600 text-white rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Tag Murid Terlibat ({selectedStudentIds.length}/{students.length}):
              </label>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                {selectedStudentIds.length === students.length ? 'Nyahpilih' : 'Pilih Semua'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {students.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => handleToggleStudent(st.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={st.avatarUrl}
                      alt={st.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs truncate">{st.preferredName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Siarkan Catatan ke Papan Ibu Bapa</span>
          </button>
        </form>
      </div>
    </div>
  );
};
