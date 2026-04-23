/**
 * Marks a key for extraction in non-component files.
 * Runtime returns the original key and translation happens at render time.
 */
export function trans(key: string): string {
  return key;
}
