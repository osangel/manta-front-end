export function firstUpperCase(str: string) {
  return str.toLowerCase().replace(/^\S/g, (s: string) => s.toUpperCase());
}
