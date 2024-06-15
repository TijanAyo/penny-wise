import mongoose, { Schema } from "mongoose";
import { Iuser } from "../interface";

const userSchema: Schema<Iuser> = new Schema<Iuser>({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  username: { type: String, trim: true, unique: true },
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date, required: false },
  phoneNumber: { type: String, trim: true, unique: true, required: true },
  password: { type: String, required: true },
  pin: { type: String },
  gender: { type: String, trim: true },
  photoUrl: { type: String },
  accountNumber: { type: String, trim: true, required: false },
  bankName: { type: String, trim: true, required: false },
  DOB: { type: String, trim: true, required: false },
  BVN: { type: String, trim: true, required: false },
  isPinSet: { type: Boolean, default: false },
  pinSetAt: { type: Date, required: false },
  address: {
    streetAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  nextOfKin: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    emailAddress: { type: String, trim: true },
    relationship: { type: String, trim: true },
    gender: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
  },
});

const User = mongoose.model<Iuser>("User", userSchema);
export default User;
