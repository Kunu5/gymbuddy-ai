import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { name, key } = await request.json();

  if (!name?.trim() || !key?.trim()) {
    return NextResponse.json({ error: "Name and key are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const normalizedKey = key.trim().toUpperCase();

  const { data: betaKey, error: lookupError } = await admin
    .from("beta_keys")
    .select("name")
    .eq("key", normalizedKey)
    .single();

  if (lookupError || !betaKey) {
    return NextResponse.json({ error: "Invalid beta key" }, { status: 401 });
  }

  if (betaKey.name.toLowerCase() !== name.trim().toLowerCase()) {
    return NextResponse.json({ error: "Name doesn't match this beta key" }, { status: 401 });
  }

  // Ensure a Supabase user exists for this beta key (idempotent)
  const email = `beta-${normalizedKey.toLowerCase()}@fitbetta-beta.app`;
  const password = normalizedKey;

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { beta: true, display_name: betaKey.name },
  });

  // Error code 422 means user already exists — that's fine
  if (createError && !createError.message.includes("already been registered") && createError.status !== 422) {
    return NextResponse.json({ error: "Failed to provision beta user" }, { status: 500 });
  }

  return NextResponse.json({ valid: true });
}
