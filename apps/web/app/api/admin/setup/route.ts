import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  hashPassword,
  generateTotpSecret,
  getTotpUri,
  verifyTotp,
  isSetupComplete,
} from "@/lib/auth";
import QRCode from "qrcode";

// Step 1: Create password + get QR code
export async function POST(request: Request) {
  if (await isSetupComplete()) {
    return NextResponse.json({ error: "Setup already complete" }, { status: 403 });
  }

  const body = await request.json();
  const { password, step, totpCode } = body;

  if (step === "password") {
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const secret = generateTotpSecret();
    const uri = getTotpUri(secret);
    const qrDataUrl = await QRCode.toDataURL(uri);

    // Store temporarily (not yet complete)
    const { rows: existing } = await query("SELECT id FROM admin_config WHERE id = 1");
    if (existing.length > 0) {
      await query(
        "UPDATE admin_config SET password_hash = $1, totp_secret = $2, setup_complete = FALSE WHERE id = 1",
        [hashPassword(password), secret]
      );
    } else {
      await query(
        "INSERT INTO admin_config (id, password_hash, totp_secret, setup_complete) VALUES (1, $1, $2, FALSE)",
        [hashPassword(password), secret]
      );
    }

    return NextResponse.json({ qrDataUrl, secret });
  }

  if (step === "verify") {
    if (!totpCode) {
      return NextResponse.json({ error: "TOTP code required" }, { status: 400 });
    }

    const { rows } = await query("SELECT * FROM admin_config WHERE id = 1");
    const config = rows[0] as { totp_secret: string } | undefined;
    if (!config) {
      return NextResponse.json({ error: "Run password step first" }, { status: 400 });
    }

    if (!verifyTotp(totpCode, config.totp_secret)) {
      return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
    }

    await query("UPDATE admin_config SET setup_complete = TRUE WHERE id = 1");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid step" }, { status: 400 });
}
