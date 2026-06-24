export function validateSeedAdminPassword(
  password: string | undefined,
): string {
  if (!password || password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters");
  }

  return password;
}
