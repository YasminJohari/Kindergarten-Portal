'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Invoice,
  ActivityPost,
  Announcement,
  ChatMessage,
  AttendanceRecord,
  PickupPerson,
} from '@/types';
import {
  INITIAL_STUDENTS,
  INITIAL_INVOICES,
  INITIAL_POSTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_MESSAGES,
} from '@/data/mockData';
import { isFirebaseConfigured } from '@/lib/firebase';
import { findParentUidByStudent, saveDoc, subscribeCollection, type WhereFilter } from '@/lib/firestore';
import type { DocumentData } from 'firebase/firestore';

export interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
  /** Auth uid of the signed-in account; null while running in Demo Mode. */
  userUid: string | null;
  setUserUid: (uid: string | null) => void;
  /** Student ids linked to a guardian account by staff (drives data scoping). */
  childIds: string[];
  setChildIds: (ids: string[]) => void;
  dataSource: 'demo' | 'firebase';
  students: Student[];
  currentStudent: Student;
  setCurrentStudentId: (id: string) => void;
  invoices: Invoice[];
  payInvoice: (invoiceId: string, method: 'fpx' | 'duitnow' | 'tng' | 'grabpay') => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  posts: ActivityPost[];
  addPost: (post: Omit<ActivityPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'hasLiked'>) => void;
  toggleLikePost: (postId: string) => void;
  addCommentToPost: (postId: string, commentText: string) => void;
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  attendance: AttendanceRecord[];
  updateAttendance: (
    recordId: string,
    status: AttendanceRecord['status'],
    temp?: number,
    notes?: string
  ) => void;
  markBatchAttendance: (records: Partial<AttendanceRecord>[]) => void;
  messages: ChatMessage[];
  sendMessage: (content: string, senderRole: 'parent' | 'teacher', attachmentName?: string) => void;
  addPickupPerson: (studentId: string, person: Omit<PickupPerson, 'id' | 'status'>) => void;
  deletePickupPerson: (studentId: string, personId: string) => void;
  remindInvoiceWhatsApp: (invoiceId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('parent');
  const [userName, setUserName] = useState<string>('Faiz Razali');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudentId, setCurrentStudentId] = useState<string>('std-1');
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [posts, setPosts] = useState<ActivityPost[]>(INITIAL_POSTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [childIds, setChildIds] = useState<string[]>([]);

  // Firestore live sync (no-op when Firebase env vars are absent).
  //
  // A guardian must never subscribe to a whole collection: Firestore rejects the
  // entire query when any single candidate row would fail a rule, so ownership
  // has to be part of the query itself. Staff keep the unfiltered subscription.
  const childKey = childIds.join(',');
  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const scoped: WhereFilter[] | undefined =
      role === 'admin' ? undefined : childKey ? [['studentId', 'in', childKey.split(',')]] : [];
    // `scoped` defined but empty means "guardian with no child linked yet".
    // In that case the demo rows must be cleared, not shown — they belong to
    // another family. Firestore's `in` operator caps at 10 values, which is
    // comfortably above any real number of siblings per account.
    const guardianScope = scoped !== undefined;

    const unsubs = [
      subscribeCollection<DocumentData & ActivityPost>('posts', (rows) => {
        // Posts are shared class updates, readable by every signed-in user.
        setPosts((prev) => (rows.length > 0 ? (rows as ActivityPost[]) : prev));
      }),
      subscribeCollection<DocumentData & Invoice>('invoices', (rows) => {
        const next = rows as unknown as Invoice[];
        setInvoices((prev) => (guardianScope ? next : next.length > 0 ? next : prev));
      }),
      subscribeCollection<DocumentData & AttendanceRecord>('attendance', (rows) => {
        const next = rows as unknown as AttendanceRecord[];
        setAttendance((prev) => (guardianScope ? next : next.length > 0 ? next : prev));
      }),
    ];
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [role, childKey]);

  // Point a guardian at their own child once the profile links one, so the
  // child record on screen is never another pupil's demo record.
  useEffect(() => {
    if (childIds.length > 0 && !childIds.includes(currentStudentId)) {
      setCurrentStudentId(childIds[0]);
    }
  }, [childIds, currentStudentId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  const payInvoice = (invoiceId: string, method: 'fpx' | 'duitnow' | 'tng' | 'grabpay') => {
    const txnId = `${method.toUpperCase()}-${Date.now().toString().slice(-8)}`;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const paidDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'PAID' as const,
              paymentMethod: method,
              transactionId: txnId,
              paidDate,
            }
          : inv
      )
    );
    if (isFirebaseConfigured) {
      saveDoc('invoices', invoiceId, {
        status: 'PAID',
        paymentMethod: method,
        transactionId: txnId,
        paidDate,
      }).catch(() => undefined);
    }
    showToast('Bayaran berjaya! Resit rasmi telah dijana untuk invois ini.');
  };

  const addInvoice = (newInvData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = `INV-TCB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: Invoice = { ...newInvData, id, invoiceNumber };
    setInvoices((prev) => [newInvoice, ...prev]);
    if (isFirebaseConfigured) {
      // Stamp the owning guardian's uid: the Firestore rules only hand an
      // invoice back to the parent whose uid it carries.
      findParentUidByStudent(newInvData.studentId)
        .then((parentUid) =>
          saveDoc('invoices', id, {
            ...newInvoice,
            ...(parentUid ? { parentUid } : {}),
            createdAt: new Date().toISOString(),
          })
        )
        .catch(() => undefined);
    }
    showToast(`Invois baharu ${invoiceNumber} berjaya dihantar kepada penjaga!`);
  };

  const addPost = (
    postData: Omit<ActivityPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'hasLiked'>
  ) => {
    const newPost: ActivityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      timestamp: 'Baru Sebentar Tadi',
      likes: 0,
      hasLiked: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    if (isFirebaseConfigured) {
      saveDoc('posts', newPost.id, { ...newPost, createdAt: new Date().toISOString() }).catch(
        () => undefined
      );
    }
    showToast('Aktiviti harian murid berjaya dikongsi kepada ibu bapa!');
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return { ...post, hasLiked, likes: hasLiked ? post.likes + 1 : post.likes - 1 };
        }
        return post;
      })
    );
  };
  const addCommentToPost = (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    const authorName = role === 'parent' ? 'Puan Yasmin (Ibu Harith)' : 'Cikgu Sarah (Guru Kelas)';
    const newComment = {
      id: `c-${Date.now()}`,
      userName: authorName,
      userRole: role === 'parent' ? ('parent' as const) : ('teacher' as const),
      content: commentText.trim(),
      timestamp: 'Baru tadi',
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = { ...ann, id: `ann-${Date.now()}` };
    setAnnouncements((prev) => [newAnn, ...prev]);
    showToast('Pengumuman sekolah berjaya disiarkan ke papan notis!');
  };

  const updateAttendance = (
    recordId: string,
    status: AttendanceRecord['status'],
    temp?: number,
    notes?: string
  ) => {
    setAttendance((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              status,
              temperature: temp !== undefined ? temp : rec.temperature,
              notes: notes !== undefined ? notes : rec.notes,
            }
          : rec
      )
    );
    showToast('Status kehadiran dan suhu murid dikemaskini.');
  };

  const markBatchAttendance = (records: Partial<AttendanceRecord>[]) => {
    setAttendance((prev) => {
      const updated = [...prev];
      records.forEach((rec) => {
        const index = updated.findIndex((r) => r.studentId === rec.studentId);
        if (index >= 0) {
          updated[index] = { ...updated[index], ...rec } as AttendanceRecord;
        } else if (rec.studentId && rec.studentName) {
          updated.push({
            id: `att-${Date.now()}-${rec.studentId}`,
            studentId: rec.studentId,
            studentName: rec.studentName,
            className: rec.className || 'Tadika 5 Tahun - Class Little Stars',
            date: rec.date || '28/09/2026',
            status: rec.status || 'present',
            checkInTime: rec.checkInTime || '08:00 AM',
            temperature: rec.temperature || 36.5,
            notes: rec.notes || '',
          });
        }
      });
      return updated;
    });
    if (isFirebaseConfigured) {
      records.forEach((rec) => {
        if (rec.studentId) {
          saveDoc('attendance', `${rec.date || '28/09/2026'}-${rec.studentId}`, {
            ...rec,
            date: rec.date || '28/09/2026',
          }).catch(() => undefined);
        }
      });
    }
    showToast('Semua rekod kehadiran kelas berjaya disimpan!');
  };
  const sendMessage = (
    content: string,
    senderRole: 'parent' | 'teacher',
    attachmentName?: string
  ) => {
    if (!content.trim() && !attachmentName) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    const senderName =
      senderRole === 'parent' ? 'Faiz bin Razali (Bapa Harith)' : 'Cikgu Sarah (Guru Kelas)';

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: senderRole === 'parent' ? 'parent-1' : 'tch-1',
      senderName,
      senderRole,
      recipientId: senderRole === 'parent' ? 'tch-1' : 'parent-1',
      content,
      timestamp: timeStr,
      status: 'sent',
      attachmentName,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const addPickupPerson = (studentId: string, personData: Omit<PickupPerson, 'id' | 'status'>) => {
    const newPerson: PickupPerson = { ...personData, id: `pup-${Date.now()}`, status: 'approved' };
    setStudents((prev) =>
      prev.map((std) =>
        std.id === studentId ? { ...std, pickupPersons: [...std.pickupPersons, newPerson] } : std
      )
    );
    showToast('Individu pengambil sah berjaya didaftarkan ke rekod keselamatan.');
  };

  const deletePickupPerson = (studentId: string, personId: string) => {
    setStudents((prev) =>
      prev.map((std) =>
        std.id === studentId
          ? { ...std, pickupPersons: std.pickupPersons.filter((p) => p.id !== personId) }
          : std
      )
    );
    showToast('Individu pengambil telah dipadam daripada senarai kebenaran.');
  };

  const remindInvoiceWhatsApp = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    showToast(`Peringatan WhatsApp berserta pautan bayaran dihantar kepada waris ${inv.studentName}!`);
  };
  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        userName,
        setUserName,
        userUid,
        setUserUid,
        childIds,
        setChildIds,
        dataSource: isFirebaseConfigured ? 'firebase' : 'demo',
        students,
        currentStudent,
        setCurrentStudentId,
        invoices,
        payInvoice,
        addInvoice,
        posts,
        addPost,
        toggleLikePost,
        addCommentToPost,
        announcements,
        addAnnouncement,
        attendance,
        updateAttendance,
        markBatchAttendance,
        messages,
        sendMessage,
        addPickupPerson,
        deletePickupPerson,
        remindInvoiceWhatsApp,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[60] flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </AppContext.Provider>
  );
};
