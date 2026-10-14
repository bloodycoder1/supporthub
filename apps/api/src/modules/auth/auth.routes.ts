
import { Router } from "express";
import { register } from "./auth.controller";
import { login } from "./auth.controller";
const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
export default authRouter;
