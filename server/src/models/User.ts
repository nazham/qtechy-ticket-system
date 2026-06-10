import mongoose, { Document, Schema } from "mongoose";
import { ROLE_PERMISSIONS, USER_ROLES, UserRole } from "../constants/enums";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: USER_ROLES,
      default: UserRole.User,
    },
  },
  { timestamps: true },
);

// Strip password from all JSON output — eliminates manual payload construction
userSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password, __v, ...rest } = ret;
    return {
      ...rest,
      permissions: ROLE_PERMISSIONS[rest.role as UserRole] || [],
    };
  },
});

export default mongoose.model<IUser>("User", userSchema);
