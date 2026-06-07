import bcrypt from "bcryptjs";
import { UserRole } from "../constants/enums";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";
import { LoginInput, RegisterInput } from "../validators/authValidators";
import { generateToken } from "../utils/generateToken";

/**
 * Registers a new user.
 * - First user ever created is automatically assigned the Admin role.
 * - Returns the sanitized user document + JWT.
 */
export const registerUserService = async (input: RegisterInput) => {
  const { name, email, password } = input;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. First user gets Admin role; all subsequent users get User role
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? UserRole.Admin : UserRole.User;

  // 4. Persist
  const user = await User.create({ name, email, password: hashedPassword, role });

  if (!user) {
    throw new AppError("Invalid user data received", 400);
  }

  return {
    ...user.toJSON(),
    token: generateToken(user.id, user.role),
  };
};

/**
 * Authenticates a user.
 * - Returns the sanitized user document + JWT on success.
 */
export const loginUserService = async (input: LoginInput) => {
  const { email, password } = input;

  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    ...user.toJSON(),
    token: generateToken(user.id, user.role),
  };
};
