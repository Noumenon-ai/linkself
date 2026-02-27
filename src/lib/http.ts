import { NextResponse } from "next/server";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: "success" | "error";
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

interface JsonResponseOptions {
  meta?: Record<string, unknown>;
  headers?: HeadersInit;
}

const DEFAULT_CORS_ORIGIN = process.env.CORS_ALLOW_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "*";

const DEFAULT_ERROR_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
};

function makeRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function mergeVary(headers: Headers, value: string): void {
  const current = headers.get("Vary");
  if (!current) {
    headers.set("Vary", value);
    return;
  }
  const values = current
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (!values.includes(value)) values.push(value);
  headers.set("Vary", values.join(", "));
}

export function createCorsHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("Access-Control-Allow-Origin", DEFAULT_CORS_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  mergeVary(headers, "Origin");
  return headers;
}

function buildMeta(meta?: Record<string, unknown>): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId: makeRequestId(),
    ...(meta ?? {}),
  };
}

function normalizeError(error: string | Partial<ApiError>, status: number): ApiError {
  if (typeof error === "string") {
    return {
      code: DEFAULT_ERROR_CODES[status] ?? "REQUEST_ERROR",
      message: error,
    };
  }

  return {
    code: error.code ?? DEFAULT_ERROR_CODES[status] ?? "REQUEST_ERROR",
    message: error.message ?? "Request failed",
    ...(error.details !== undefined ? { details: error.details } : {}),
  };
}

function logResponse(statusCode: number, payload: ApiResponse<unknown>): void {
  const level = payload.status === "success" ? "info" : "warn";
  console[level](
    JSON.stringify({
      level,
      type: "api_response",
      statusCode,
      requestId: payload.meta.requestId,
      timestamp: payload.meta.timestamp,
      errorCode: payload.error?.code ?? null,
    })
  );
}

function buildJsonHeaders(init?: HeadersInit): Headers {
  const headers = createCorsHeaders(init);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return headers;
}

export function jsonOk<T>(
  data: T,
  status = 200,
  options: JsonResponseOptions = {}
): NextResponse<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    ok: true,
    status: "success",
    data,
    error: null,
    meta: buildMeta(options.meta),
  };

  logResponse(status, payload as ApiResponse<unknown>);

  return NextResponse.json(payload, {
    status,
    headers: buildJsonHeaders(options.headers),
  });
}

export function jsonError(
  error: string | Partial<ApiError>,
  status = 400,
  options: JsonResponseOptions = {}
): NextResponse<ApiResponse<null>> {
  const payload: ApiResponse<null> = {
    ok: false,
    status: "error",
    data: null,
    error: normalizeError(error, status),
    meta: buildMeta(options.meta),
  };

  logResponse(status, payload);

  return NextResponse.json(payload, {
    status,
    headers: buildJsonHeaders(options.headers),
  });
}

export function jsonPreflight(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders(),
  });
}

export function paginationMeta(page: number, limit: number, total: number): ApiMeta["pagination"] {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(url: URL, defaultLimit = 25, maxLimit = 100): PaginationParams {
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const rawLimit = Number(url.searchParams.get("limit") ?? String(defaultLimit));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(maxLimit, Math.floor(rawLimit))
    : defaultLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export interface ApiClientError {
  code?: string;
  message?: string;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as ApiClientError).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export interface LegacyApiResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string | ApiError | null;
}
