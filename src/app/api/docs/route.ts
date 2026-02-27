import { jsonOk } from "@/lib/http";

const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "LinkSelf API",
    version: "1.0.0",
    description: "Self-hosted link-in-bio API for LinkSelf.",
  },
  servers: [{ url: "/" }],
  components: {
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          details: {},
        },
        required: ["code", "message"],
      },
      ApiMeta: {
        type: "object",
        properties: {
          timestamp: { type: "string", format: "date-time" },
          requestId: { type: "string" },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
        required: ["timestamp", "requestId"],
      },
      ApiEnvelope: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          status: { type: "string", enum: ["success", "error"] },
          data: {},
          error: { oneOf: [{ $ref: "#/components/schemas/ApiError" }, { type: "null" }] },
          meta: { $ref: "#/components/schemas/ApiMeta" },
        },
        required: ["ok", "status", "data", "error", "meta"],
      },
    },
  },
  paths: {
    "/api/health": { get: { summary: "Health check" } },
    "/api/docs": { get: { summary: "OpenAPI document" } },
    "/api/auth/register": { post: { summary: "Register a new account" } },
    "/api/auth/login": { post: { summary: "Login with email/password" } },
    "/api/auth/logout": { post: { summary: "Logout current session" } },
    "/api/auth/me": { get: { summary: "Get current user" } },
    "/api/links": {
      get: {
        summary: "List links (paginated)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200 } },
        ],
      },
      post: { summary: "Create link" },
    },
    "/api/links/{id}": {
      patch: { summary: "Update link" },
      delete: { summary: "Delete link" },
    },
    "/api/links/reorder": { put: { summary: "Reorder links" } },
    "/api/social-icons": {
      get: {
        summary: "List social icons (paginated)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200 } },
        ],
      },
      post: { summary: "Create social icon" },
    },
    "/api/social-icons/{id}": { delete: { summary: "Delete social icon" } },
    "/api/settings": { get: { summary: "Get profile settings" }, patch: { summary: "Update profile settings" } },
    "/api/analytics/overview": { get: { summary: "Dashboard analytics overview" } },
    "/api/analytics/clicks": { get: { summary: "Detailed analytics" } },
    "/api/click/{id}": { get: { summary: "Track click and redirect" } },
  },
} as const;

export async function GET() {
  return jsonOk(openApiDocument);
}
