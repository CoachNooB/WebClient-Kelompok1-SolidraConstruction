export async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV === "production") return fn();
  const started = performance.now();
  try {
    return await fn();
  } finally {
    console.log(`[timing] ${label}: ${Math.round(performance.now() - started)}ms`);
  }
}
