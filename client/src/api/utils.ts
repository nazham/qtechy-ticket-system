export function extractApiError(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (error && typeof error === 'object') {
    // Axios Error
    if ('response' in error) {
      const e = error as { response?: { data?: { message?: string } } };
      return e.response?.data?.message ?? fallback;
    }
    // RTK Query FetchBaseQueryError
    if ('data' in error) {
      const e = error as { data?: { message?: string } };
      return e.data?.message ?? fallback;
    }
  }
  return 'Network error — please try again';
}
