import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * Parse and validate a JSON request body against a Zod schema.
 *
 * Returns either `{ data }` (validated, typed) or `{ error }` (a ready-to-return
 * 400 response). Usage:
 *
 *   const parsed = await parseBody(req, Body);
 *   if ("error" in parsed) return parsed.error;
 *   const { field } = parsed.data;
 */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return { error: NextResponse.json({ error: "Invalid input" }, { status: 400 }) };
  }
  return { data: result.data };
}
