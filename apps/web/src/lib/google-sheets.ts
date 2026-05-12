import 'server-only';
import { clerkClient } from '@clerk/nextjs/server';

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetch the user's Google OAuth access token from Clerk. The token must have
 * been granted at sign-in via additional scopes configured in Clerk's
 * Google OAuth provider (at minimum: https://www.googleapis.com/auth/drive.file
 * which allows creating Sheets the user owns).
 */
async function getGoogleAccessToken(userId: string): Promise<string> {
  const client = await clerkClient();
  const resp = (await client.users.getUserOauthAccessToken(
    userId,
    'oauth_google',
  )) as unknown as { data?: Array<{ token?: string }>; token?: string };
  // Clerk SDK v6 returns { data: [...] } while older returns array directly.
  const token =
    resp.data?.[0]?.token ??
    (Array.isArray(resp) ? (resp as unknown as Array<{ token?: string }>)[0]?.token : undefined);
  if (!token) throw new Error('NO_GOOGLE_TOKEN');
  return token;
}

async function gfetch(token: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      throw new Error('GOOGLE_AUTH_INSUFFICIENT');
    }
    throw new Error(`GOOGLE_API_ERROR: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Create a new Google Sheet for the user populated with `rows` (the first row
 * is treated as headers). Returns the spreadsheet URL.
 */
export async function createSpreadsheetForUser(
  userId: string,
  title: string,
  rows: (string | number)[][],
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getGoogleAccessToken(userId);

  // 1) Create the spreadsheet
  const created = (await gfetch(token, SHEETS_BASE, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: [{ properties: { title: 'Applications' } }],
    }),
  })) as { spreadsheetId: string; spreadsheetUrl: string };

  // 2) Append values starting at A1
  await gfetch(
    token,
    `${SHEETS_BASE}/${created.spreadsheetId}/values/Applications!A1:append?valueInputOption=RAW`,
    {
      method: 'POST',
      body: JSON.stringify({
        values: rows,
        majorDimension: 'ROWS',
      }),
    },
  );

  // 3) Format header row (bold). Best-effort; ignore failures.
  await gfetch(token, `${SHEETS_BASE}/${created.spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    }),
  }).catch(() => null);

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
  };
}
