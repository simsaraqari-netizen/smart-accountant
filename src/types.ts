import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense' | 'custody_in' | 'custody_out';

export interface TransactionSplit {
  personName: string;
  amount: number;
  percentage: number;
}

export interface Transaction {
  id?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Timestamp;
  description: string;
  userId: string;
  custodyAccountId?: string;
  isCustodyLinked?: boolean;
  custodyAmount?: number;
  personName?: string;
  splitType?: 'individual' | 'joint';
  splits?: TransactionSplit[];
}

export interface CustodyAccount {
  id?: string;
  name: string;
  balance: number;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  fcmTokens?: string[];
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId: string;
  tenantId: string;
  lastNotified?: Timestamp;
  enabled: boolean;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
