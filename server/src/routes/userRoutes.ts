import { Router } from "express";
import {
  getUsers,
  promoteToAgent,
  demoteToUser,
  getUsersDirectory,
  deleteUser,
} from "../controllers/userController";
import { authorizePermissions, protect } from "../middleware/authMiddleware";
import { Permission } from "../constants/enums";
import { validateParams } from "../middleware/validate";
import { userIdParamSchema } from "../validators/userValidators";

const router = Router();

// Require authentication for all routes in this router
router.use(protect);
router.use(authorizePermissions(Permission.ManageUsers));

router.route("/").get(getUsers);
router.route("/directory").get(getUsersDirectory);
router.route("/:id").delete(validateParams(userIdParamSchema), deleteUser);
router.route("/:id/promote").put(validateParams(userIdParamSchema), promoteToAgent);
router.route("/:id/demote").put(validateParams(userIdParamSchema), demoteToUser);

export default router;
