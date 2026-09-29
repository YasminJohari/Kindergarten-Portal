'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Heart, MessageSquare, Share2, Clock, Smile, Send, Pin, Sparkles } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, announcements, toggleLikePost, addCommentToPost, currentStudent } = useApp();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Learning', 'Play & Creative', 'Meals & Snack'];

  const filteredPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;
    addCommentToPost(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Child Daily Status Banner */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentStudent.avatarUrl}
              alt={currentStudent.name}
              className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{currentStudent.name}</span>
                <span className="bg-emerald-400/30 text-emerald-50 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300/30">
                  {currentStudent.preferredName}
                </span>
              </div>
              <p className="text-xs text-emerald-50">
                {currentStudent.className} • Umur {currentStudent.age} Tahun
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                  Hadir Hari Ini: 07:48 AM
                </span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-medium">
                  Suhu: 36.5 C (Normal)
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/20 text-center sm:text-right w-full sm:w-auto">
            <p className="text-[10px] text-emerald-50 uppercase font-bold tracking-wider">
              Status Harian
            </p>
            <p className="text-sm font-semibold">Sesi Pembelajaran Aktif</p>
          </div>
        </div>
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Aktiviti' : cat}
            </button>
          ))}
        </div>

        {/* Daily Activity Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={post.teacherAvatar}
                    alt={post.teacherName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                      {post.teacherName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="hidden sm:inline">{post.className}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                  {post.category}
                </span>
              </div>
              <div className="p-4 sm:p-5 pb-3">
                <h4 className="font-bold text-base text-slate-900 mb-2">{post.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>

                {post.taggedStudentIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">Murid:</span>
                    {post.taggedStudentIds.includes('std-1') && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                        <Smile className="w-3 h-3 text-amber-600" />
                        Ahmad Harith (Anak Anda)
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px]">
                      {post.taggedStudentIds.length} murid terlibat
                    </span>
                  </div>
                )}
              </div>

              {post.images.length > 0 && (
                <div
                  className={`grid gap-2 px-4 sm:px-5 pb-4 ${
                    post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}
                >
                  {post.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-xl bg-slate-100 group max-h-72 sm:max-h-80"
                    >
                      <img
                        src={imgUrl}
                        alt="Aktiviti Tadika"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                      post.hasLiked
                        ? 'text-rose-600 bg-rose-50 font-bold'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{post.likes} Suka</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Komen</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Pautan aktiviti disalin untuk dikongsi kepada ahli keluarga!')}
                  className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kongsi</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 items-start text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1 border border-slate-100">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <span className="font-bold text-slate-800 truncate">{comment.userName}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-normal">{comment.content}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                    placeholder="Tulis maklum balas kepada cikgu..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Noticeboard & Emergency Contacts */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Papan Notis Tadika</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Terkini
            </span>
          </div>

          <div className="space-y-3.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  ann.important
                    ? 'bg-amber-50/70 border-amber-200 text-slate-800'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] whitespace-nowrap ${
                      ann.important ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ann.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 leading-snug">{ann.title}</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed mb-2">{ann.content}</p>
                <p className="text-[10px] text-slate-400 italic">Oleh: {ann.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm">Talian Kecemasan Tadika</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Untuk pemberitahuan kecemasan atau kelewatan menjemput murid:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-xl gap-2">
              <span className="text-slate-300">Pejabat Tadika:</span>
              <span className="font-mono font-bold text-emerald-400 whitespace-nowrap">
                +60 3-5521 8900
              </span>
            </div>
            <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-xl gap-2">
              <span className="text-slate-300">WhatsApp Guru:</span>
              <span className="font-mono font-bold text-emerald-400 whitespace-nowrap">
                +60 19-332 1109
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
