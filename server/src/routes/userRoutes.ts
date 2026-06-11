import { Router } from "express";
import { getUsers } from "../controllers/userController";
import { authorizePermissions, protect } from "../middleware/authMiddleware";
import { Permission } from "../constants/enums";

const router = Router();

// Only Admin can manage/view all users (for assigning tickets)
router.use(protect);
router.use(authorizePermissions(Permission.ManageUsers));

router.route("/").get(getUsers);

export default router;
