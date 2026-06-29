export function isActivePath(
  pathname: string,
  target: string,
  exact = false,
): boolean {
  if (pathname === target) return true;
  if (exact) return false;
  return pathname.startsWith(`${target}/`);
}
