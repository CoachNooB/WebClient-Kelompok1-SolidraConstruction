export function isActivePath(
  pathname: string,
  target: string,
  exact = false,
): boolean {
  const normalizedPathname = normalizePath(pathname);
  const normalizedTarget = normalizePath(target);
  if (normalizedPathname === normalizedTarget) return true;
  if (exact) return false;
  return normalizedPathname.startsWith(`${normalizedTarget}/`);
}

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
