import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { handleError, json, ApiError } from "@/lib/api/http";
import { getEntityManager } from "@/lib/db/client";
import { User } from "@/lib/db/entities";
import { verifyPassword } from "@/lib/auth/password";
import { issueTokensForUser } from "@/lib/auth/session";
import { assertWithinRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/api/auth";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const payload = loginSchema.parse(await request.json());
    const ip = getClientIp(request);
    const rateKey = `login:${ip}:${payload.email.toLowerCase()}`;
    assertWithinRateLimit(rateKey, env.rateLimitMaxAttempts, env.rateLimitWindowMs);

    const em = await getEntityManager();
    const user = await em.findOne(User, { email: payload.email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isValid = await verifyPassword(payload.password, user.password);
    if (!isValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const tokens = await issueTokensForUser({ id: user.id, email: user.email, name: user.name, role: user.role });
    return json(tokens);
  } catch (error) {
    return handleError(error);
  }
}
