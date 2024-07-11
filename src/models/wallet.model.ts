import mongoose, { Schema } from "mongoose";
import { Iwallet } from "../interface";

const walletSchema: Schema<Iwallet> = new Schema<Iwallet>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    account_number: { type: String, trim: true, required: true, unique: true },
    balance: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

const Wallet = mongoose.model<Iwallet>("Wallet", walletSchema);
export default Wallet;
