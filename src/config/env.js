export function envValue(name) {
  const runtime = typeof window !== 'undefined' ? window.__ENV__ : undefined;
  if (runtime && runtime[name]) return runtime[name];
  return import.meta.env[name];
}
