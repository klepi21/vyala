export type Role = "admin" | "doctor" | "assistant";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";
export type InvoiceStatus = "draft" | "issued" | "paid";
export type ExpenseCategory =
  | "rent" | "salaries" | "supplies" | "equipment"
  | "utilities" | "insurance" | "marketing" | "other";

export interface Clinic {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  isDemo?: boolean;
  createdAt: string;
}

export interface Member {
  id: string;
  clinicId: string;
  clerkUserId: string | null;
  email: string;
  fullName: string;
  role: Role;
  specialty: string | null;
  createdAt: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  amka: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  address: string | null;
  allergies: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  startsAt: string;
  durationMin: number;
  status: AppointmentStatus;
  reason: string | null;
  createdAt: string;
  patientName?: string;
  doctorName?: string | null;
}

export interface Visit {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  visitDate: string;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  createdAt: string;
  doctorName?: string | null;
}

export interface Payment {
  id: string;
  clinicId: string;
  patientId: string | null;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note: string | null;
  createdAt: string;
  patientName?: string | null;
}

export interface Invoice {
  id: string;
  clinicId: string;
  patientId: string | null;
  number: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  note: string | null;
  createdAt: string;
  patientName?: string | null;
}

export interface Doc {
  id: string;
  clinicId: string;
  patientId: string;
  fileName: string;
  fileId: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  clinicId: string;
  amount: number;
  category: ExpenseCategory;
  supplier: string | null;
  spentAt: string;
  note: string | null;
  createdAt: string;
}
