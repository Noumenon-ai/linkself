import { errorMessage, type ApiResponse, type LegacyApiResponse } from "./http";

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = (await res.json()) as ApiResponse<T> | LegacyApiResponse<T>;

  const isSuccess =
    "status" in json
      ? json.status === "success"
      : Boolean(json.ok);

  if (!res.ok || !isSuccess) {
    throw new Error(errorMessage(json.error, "Request failed"));
  }

  return (json.data ?? null) as T;
}
