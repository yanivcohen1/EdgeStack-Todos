import { NextRequest } from "next/server";
import { refreshSchema } from "@/lib/validation/auth";
import { handleError, json, ApiError } from "@/lib/api/http";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { getEntityManager } from "@/lib/db/client";
import { RefreshToken } from "@/lib/db/entities";
import { rotateRefreshToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const payload = refreshSchema.parse(await request.json());
    let tokenPayload;
    try {
      tokenPayload = verifyRefreshToken(payload.refreshToken);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const em = await getEntityManager();
    const tokenRecord = await em.findOne(RefreshToken, { id: tokenPayload.tokenId }, { populate: ["user"] });
    if (!tokenRecord || !tokenRecord.user) {
      throw new ApiError(401, "Refresh token revoked");
    }

    if (tokenRecord.token !== payload.refreshToken) {
      throw new ApiError(401, "Refresh token mismatch");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token expired");
    }

    const tokens = await rotateRefreshToken(tokenRecord.id, {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
      role: tokenRecord.user.role
    });

    return json(tokens);
  } catch (error) {
    return handleError(error);
  }
}
