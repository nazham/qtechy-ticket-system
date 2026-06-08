export function extractApiError(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return "Network error — please try again";
}
