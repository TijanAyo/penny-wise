import mongoose, { Schema } from "mongoose";
import { Iwallet } from "../common/interface";

const walletSchema: Schema<Iwallet> = new Schema<Iwallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account_number: { type: String, trim: true, required: true, unique: true },
    account_bank: { type: String, trim: true, required: true },
    balance: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

const Wallet = mongoose.model<Iwallet>("Wallet", walletSchema);
export default Wallet;
