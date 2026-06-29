// Shared DTO/contract types between backend, admin, and (reference for) mobile.
export type AccountType = 'SAVINGS' | 'CURRENT' | 'WALLET';
export type TxnType = 'TRANSFER_IN' | 'TRANSFER_OUT' | 'BILL_PAYMENT' | 'TOPUP' | 'ADJUSTMENT';
export type TxnStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'AUDITOR';

export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface UserDto { id: string; email: string; fullName: string; biometricEnabled?: boolean; }
export interface AccountDto { id: string; accountNumber: string; name: string; type: AccountType; balance: number; }
export interface TransferRequest {
  fromAccountId: string; toAccountNumber: string; amount: number;
  channel: 'OWN' | 'OTHER' | 'PROMPTPAY'; note?: string; pin?: string;
}
export interface TransferResult { success: boolean; reference: string; amount: number; balanceAfter: number; }
