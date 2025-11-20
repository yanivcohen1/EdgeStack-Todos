import jwt from "jsonwebtoken";
import { env } from "../env";
import type { UserRole } from "@/types/auth";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtlSeconds });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtlSeconds });

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
