export function getException(fn: () => void) {
  try {
    fn();
  } catch (e) {
    return e;
  }
}
