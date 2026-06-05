import mongoose, { Document, Schema, Types } from "mongoose";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../constants/enums";

export interface IComment {
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IStatusHistory {
  status: TicketStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
}

export interface ITicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  comments: IComment[];
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new Schema<IStatusHistory>({
  status: {
    type: String,
    enum: TICKET_STATUSES,
    required: true,
  },
  changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  changedAt: { type: Date, default: Date.now },
});

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: true,
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      required: true,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: TicketStatus.Open,
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [commentSchema],
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
