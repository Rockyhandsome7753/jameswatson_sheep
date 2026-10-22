/**
 * Telegram notification utility.
 * Replace BOT_TOKEN and CHAT_ID with your actual values.
 */

const BOT_TOKEN = "8673929083:AAFn2wRLlVSBwFTM-ERyQz_fd-112rmFMbc";
const CHAT_ID = "-5556202624";

const API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/** Send a plain-text message to the configured Telegram chat. */
export async function sendToTelegram(text: string): Promise<void> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[Telegram] send failed:", res.status, err);
    }
  } catch (e) {
    console.error("[Telegram] fetch error:", e);
    // Fallback: no-cors (response is opaque but the POST still reaches Telegram)
    try {
      await fetch(API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch (e2) {
      console.error("[Telegram] no-cors fallback failed:", e2);
    }
  }
}

/** Format an object of key→value pairs into a readable message block. */
export function formatEntry(title: string, data: Record<string, string>): string {
  const ts = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const lines = Object.entries(data)
    .map(([k, v]) => `  <b>${k}:</b> ${v}`)
    .join("\n");

  return `🔔 <b>${title}</b>\n⏰ ${ts}\n\n${lines}`;
}
