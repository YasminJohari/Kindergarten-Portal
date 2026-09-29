export type UserRole = 'parent' | 'admin';

export interface Student {
  id: string;
  mykad: string;
  name: string;
  preferredName: string;
  gender: 'male' | 'female';
  age: number;
  dob: string;
  classId: string;
  className: string;
  avatarUrl: string;
  bloodType: string;
  allergies: string[];
  dietaryRestrictions: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  pickupPersons: PickupPerson[];
}

export interface PickupPerson {
  id: string;
  name: string;
  relationship: string;
  mykad: string;
  phone: string;
  carPlate: string;
  photoUrl: string;
  status: 'approved' | 'pending' | 'restricted';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string; // DD/MM/YYYY
  status: 'present' | 'absent' | 'late' | 'sick';
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number; // In Celsius (e.g., 36.6)
  notes?: string;
  pickupBy?: string;
  /** Auth uid of the guardian this record belongs to (written by staff/mark). */
  parentUid?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  category: 'tuition' | 'meal' | 'uniform' | 'activity' | 'late_penalty' | 'other';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  month: string; // e.g. "Oktober 2026"
  issueDate: string; // DD/MM/YYYY
  dueDate: string;
  paidDate?: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: 'fpx' | 'duitnow' | 'tng' | 'grabpay';
  transactionId?: string;
  /**
   * Auth uid of the owning guardian. Firestore security rules let a parent read
   * only invoices carrying their own uid, so this must be set whenever an
   * invoice is mirrored to Firestore.
   */
  parentUid?: string;
}

export interface ActivityPost {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  className: string;
  category: 'Learning' | 'Play & Creative' | 'Meals & Snack' | 'Nap & Rest' | 'Special Event';
  title: string;
  description: string;
  timestamp: string;
  date: string;
  images: string[];
  taggedStudentIds: string[];
  likes: number;
  hasLiked?: boolean;
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  userName: string;
  userRole: 'parent' | 'teacher';
  content: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'holiday' | 'event' | 'urgent' | 'general';
  content: string;
  date: string;
  badgeText: string;
  important: boolean;
  author: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher';
  recipientId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentName?: string;
}
