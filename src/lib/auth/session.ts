import crypto from "node:crypto";
import { env } from "../env";
import { signAccessToken, signRefreshToken } from "./jwt";
import { getEntityManager } from "../db/client";
import { RefreshToken } from "../db/entities/RefreshToken";
import { User } from "../db/entities/User";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, "id" | "email" | "name" | "role">;
};
const refreshExpiry = () => new Date(Date.now() + env.jwtRefreshTtlSeconds * 1000);

const createRefreshToken = async (userId: string) => {
  const em = await getEntityManager();
  const refresh = em.create(RefreshToken, {
    token: crypto.randomUUID(),
    expiresAt: refreshExpiry(),
    user: em.getReference(User, userId)
  });
  await em.persistAndFlush(refresh);
  return refresh;
};

export const pruneExpiredTokens = async (userId: string) => {
  const em = await getEntityManager();
  await em.nativeDelete(RefreshToken, {
    user: userId,
    expiresAt: { $lt: new Date() }
  });
};

export const issueTokensForUser = async (user: Pick<User, "id" | "email" | "name" | "role">): Promise<AuthTokens> => {
  await pruneExpiredTokens(user.id);
  const refresh = await createRefreshToken(user.id);

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId: refresh.id });

  return {
    accessToken,
    refreshToken,
    user
  };
};

export const rotateRefreshToken = async (
  tokenId: string,
  user: Pick<User, "id" | "email" | "name" | "role">
): Promise<AuthTokens> => {
  const em = await getEntityManager();
  await em.nativeDelete(RefreshToken, { id: tokenId });
  return issueTokensForUser(user);
};

export const revokeRefreshToken = async (tokenId: string) => {
  const em = await getEntityManager();
  await em.nativeDelete(RefreshToken, { id: tokenId });
};
