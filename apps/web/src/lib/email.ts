import 'server-only';

export const INBOUND_DOMAIN = process.env.INBOUND_DOMAIN ?? 'track.applypulse.app';

/**
 * Extract the user forwarding alias from a recipient email address.
 *
 * The alias is the local-part of `<alias>@track.applypulse.app`. Plus-tags
 * (e.g. `<alias>+anything@track.applypulse.app`) are stripped.
 *
 * Returns null if the address is not on our inbound domain.
 */
export function aliasFromAddress(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const lower = addr.toLowerCase().trim();
  // Strip display name and angle brackets: "Foo Bar <foo@x.com>" -> "foo@x.com"
  const match = lower.match(/<([^>]+)>/);
  const email = (match?.[1] ?? lower).trim();
  const [local, domain] = email.split('@');
  if (!local || !domain) return null;
  if (!domain.endsWith(INBOUND_DOMAIN)) return null;
  return local.split('+')[0] ?? null;
}

export function inboundAddressForAlias(alias: string): string {
  return `${alias}@${INBOUND_DOMAIN}`;
}
