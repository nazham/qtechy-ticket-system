export function extractApiError(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (error && typeof error === 'object') {
    // RTK Query FetchBaseQueryError
    if ('data' in error) {
      const e = error as { data?: { message?: string } };
      return e.data?.message ?? fallback;
    }
  }
  return 'Network error — please try again';
}
