import { NextRequest } from "next/server";
import { ApiError, handleError, json } from "@/lib/api/http";
import { requireUser, toClientUser } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser(request);
    const scope = request.nextUrl.searchParams.get("scope");
    if (scope === "admin-inspect" && user.role !== "admin") {
      throw new ApiError(403, "Admin privileges required");
    }
    return json({ user: toClientUser(user) });
  } catch (error) {
    return handleError(error);
  }
}
