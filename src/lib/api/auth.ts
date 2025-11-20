import { NextRequest } from "next/server";
import { verifyAccessToken } from "../auth/jwt";
import { ApiError } from "./http";
import { getEntityManager } from "../db/client";
import { User } from "../db/entities";
import type { SessionUser } from "@/types/auth";

export type AuthenticatedContext = {
  user: User;
};

const extractBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

export const requireUser = async (request: NextRequest): Promise<AuthenticatedContext> => {
  const token = extractBearerToken(request);
  if (!token) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  try {
    const payload = verifyAccessToken(token);
    const em = await getEntityManager();
    const user = await em.findOne(User, { id: payload.sub });
    if (!user) {
      throw new ApiError(401, "Invalid token subject");
    }
    return { user };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid or expired access token");
  }
};

export const toClientUser = (user: User): SessionUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

export const getClientIp = (request: NextRequest) =>
  request.ip ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
