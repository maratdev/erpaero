import { Router } from "express";
import {
  authenticate,
  createUser,
  destroyAllToken,
  destroyToken,
  login,
  refreshTokenCheck,
} from '../controllers/auth.controller.js';
import { validationCreateUser, validationLogin } from '../middlewares/validation.js';
const router = Router();

router.route("/signup").post(validationCreateUser, createUser);
router.route("/signin").post(validationLogin, login);

// secured routes
router.route("/refresh-token").get(refreshTokenCheck);
router.route("/logout").get(authenticate, destroyToken);
router.route("/all-logout").get(authenticate, destroyAllToken);

export default router;