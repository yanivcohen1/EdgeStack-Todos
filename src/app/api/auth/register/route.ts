import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { issueTokensForUser } from "@/lib/auth/session";
import { getEntityManager } from "@/lib/db/client";
import { User } from "@/lib/db/entities";
import { handleError, json, ApiError } from "@/lib/api/http";

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());
    const em = await getEntityManager();

    const existing = await em.findOne(User, { email: payload.email });
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    const user = em.create(User, {
      email: payload.email.toLowerCase(),
      name: payload.name,
      password: await hashPassword(payload.password),
      role: "user"
    });

    await em.persistAndFlush(user);

    const tokens = await issueTokensForUser({ id: user.id, email: user.email, name: user.name, role: user.role });
    return json(tokens, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
