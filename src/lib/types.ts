export type Role = "ADMIN" | "CLIENT";
export type CutType = "NORMAL" | "REWARD_FREE" | "BIRTHDAY_FREE" | "FIADO";

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  birthDate: string;
  avatarBase64?: string | null;
  role: Role;
  isActive: boolean;
  blockedReason: string | null;
}

export interface LoyaltyCycle {
  cycleNumber: number;
  stamps: number;
  stampsRequired: number;
  completed: boolean;
  completedAt: string | null;
}

export interface CycleStamp {
  isFiadoUnpaid: boolean;
}

export interface CardStatus {
  cutsRequiredForReward: number;
  stampsSinceReward: number;
  remainingForReward: number;
  rewardReady: boolean;
  totalCuts: number;
  totalRewardCutsGiven: number;
  totalBirthdayCutsGiven: number;
  totalFiadoCutsGiven: number;
  isBirthdayToday: boolean;
  birthdayDiscountLabel: string;
  rewardDiscountLabel: string;
  currentCycleStamps: CycleStamp[];
  cycles: LoyaltyCycle[];
}

export interface CutPersonRef {
  id?: string;
  username: string;
  fullName: string;
}

export interface CutRecord {
  id: string;
  type: CutType;
  note: string | null;
  /** Solo relevante para type === "FIADO". */
  amountPaid: number | null;
  isPaid: boolean;
  date: string;
  admin?: CutPersonRef;
  client?: CutPersonRef;
}

export interface BusinessSettings {
  id?: number;
  businessName: string;
  cutsRequiredForReward: number;
  birthdayDiscountLabel: string;
  rewardDiscountLabel: string;
  cutPrice: number;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  updatedAt?: string;
}

export interface AdminUserListItem extends AuthUser {
  createdAt: string;
  blockedAt: string | null;
  _count: { cuts: number };
}

export interface AdminUserDetail extends AuthUser {
  createdAt: string;
  updatedAt: string;
  blockedAt: string | null;
  blockedBy: CutPersonRef | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
