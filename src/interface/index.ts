import { Types } from "mongoose";

interface Address {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
}

interface NextOfKin {
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
  emailAddress: string;
  isEmailVerified: boolean;
  emailVerifiedAt: Date;
  phoneNumber: string;
  password: string;
  pin: string;
  gender: string;
  photoUrl: string;
  accountNumber: string;
  bankName: string;
  DOB: string;
  BVN: string;
  isPinSet: boolean;
  pinSetAt: Date;
  address: Address;
  nextOfKin: NextOfKin;
}

export interface registerPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}
