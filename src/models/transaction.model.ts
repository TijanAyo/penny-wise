import mongoose, { Schema } from "mongoose";
import { Itransaction, TransactionStatus, TransactionType } from "../interface";

const transactionSchema: Schema<Itransaction> = new Schema<Itransaction>(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    from: { type: String, trim: true },
    recipient_name: { type: String, trim: true, required: true },
    recipient_bank: { type: String, trim: true, required: true },
    date: { type: String, trim: true, required: true },
    amount_credited: { type: String, trim: true },
    amount_debited: { type: String, trim: true },
    reference: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: TransactionType,
      required: true,
    },
    status: {
      type: String,
      enum: TransactionStatus,
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true },
);

const Transaction = mongoose.model<Itransaction>(
  "Transaction",
  transactionSchema,
);
export default Transaction;
