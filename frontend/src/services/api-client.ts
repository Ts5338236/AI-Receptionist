/**
 * Centralized API Client for AI Receptionist Enterprise Kiosk.
 * Implements RFC 7807 Problem Details error parsing, request timeouts,
 * correlation ID tracking, and typed fetch handling.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  correlation_id?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public status: number;
  public problem?: ApiProblemDetails;

  constructor(message: string, status: number, problem?: ApiProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, token, headers = {}, ...restOptions } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const correlationId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `req-${Date.now()}`;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Correlation-ID": correlationId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let problem: ApiProblemDetails | undefined;
      try {
        problem = await response.json();
      } catch {
        // Fallback for non-JSON errors
      }

      const errorMessage =
        problem?.detail ||
        problem?.title ||
        `Request to ${endpoint} failed with HTTP status ${response.status}`;

      throw new ApiError(errorMessage, response.status, problem);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if ((error as { name?: string }).name === "AbortError") {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408);
    }
    throw new ApiError(
      (error as Error).message || "An unexpected network error occurred",
      0
    );
  }
}
