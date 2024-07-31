import { Types } from "mongoose";

interface Address {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
}

export interface NextOfKin {
  firstName: string;
  lastName: string;
  emailAddress: string;
  relationship: string;
  gender: string;
  phoneNumber: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  city: string;
  country: string;
  state: string;
}

export interface Iuser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  usernameUpdatedAt: Date;
  emailAddress: string;
  isEmailVerified: boolean;
  emailVerifiedAt: Date;
  phoneNumber: string;
  password: string;
  passwordChangedAt: Date;
  pin: string;
  gender: string;
  photoUrl: string;
  settlementAccountNumber: string;
  settlementAccountName: string;
  isSettlementAccountSet: boolean;
  bankName: string;
  DOB: string;
  BVN: string;
  isPinSet: boolean;
  pinSetAt: Date;
  address: Address;
  nextOfKin: NextOfKin;
  wallet: Iwallet;
}

export interface registerPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

export interface loginPayload {
  email?: string | null;
  username?: string | null;
  password: string;
}

export interface forgotPasswordPayload {
  email: string;
}

export interface resetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Iwallet extends Document {
  _id: Types.ObjectId;
  account_number: string;
  account_bank: string;
  balance: number;
  user: Iuser;
  transactions: Itransaction;
}

export enum TransactionType {
  DISBURSE = "disburse",
  FUNDING = "funding",
  P2P = "p2p",
}

export enum TransactionStatus {
  FAILED = "Failed",
  SUCCESSFUL = "Successful",
}

export interface Itransaction extends Document {
  _id: Types.ObjectId;
  from: string;
  recipient_name: string;
  recipient_account_number: string;
  recipient_bank: string;
  date: string;
  amount_credited: string;
  amount_debited: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  wallet: Iwallet;
}

export interface createVirtualAccountNumberPayload {
  bvn: string;
}

export interface VirtualAccountResponse {
  status: string;
  message: string;
  data: VirtualAccountData;
}

export interface VirtualAccountData {
  response_code: string;
  response_message: string;
  flw_ref: string;
  order_ref: string;
  account_number: string;
  account_status: string;
  frequency: number;
  bank_name: string;
  created_at: number;
  expiry_date: string;
  note: string;
  amount: string;
}

export interface transactionData {
  from?: string;
  recipient_name: string;
  recipient_bank: string;
  amount_credited?: string;
  amount_debited?: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference: string;
}

export interface setTransactionPinPayload {
  pin: string;
  confirm_pin: string;
}

export interface setUsernamePayload {
  username: string;
}

export interface changePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

export interface createOtpPayload {
  reason: string;
}

export interface updateProfileInfoPayload {
  username?: string;
  gender?: string;
  address?: Address;
  nextOfKin?: NextOfKin;
}

export interface disbursePayload {
  accountBank: string;
  accountNumber: string;
  amount: number;
  narration: string;
  pin: string;
}
