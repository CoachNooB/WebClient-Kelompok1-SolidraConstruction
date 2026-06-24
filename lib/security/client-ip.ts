const defaultTrustedHeader = "x-real-ip";

export function getClientIp(request: Request): string {
  const configured = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  const header = configured || defaultTrustedHeader;
  const value = request.headers.get(header)?.trim();

  if (value) return value.split(",")[0]?.trim() || "unknown";

  return "unknown";
}
