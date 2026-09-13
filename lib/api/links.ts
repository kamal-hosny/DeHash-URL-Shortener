import { Link } from "@/store/linkStore";
import {
  CreateLinkInput,
  CreateLinkResponse,
  DeleteLinkResponse,
  LinkAnalyticsResponse,
} from "./types";

/**
 * Pure API client for Link management
 */

export async function fetchLinks(): Promise<Link[]> {
  const res = await fetch("/api/links", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch links: ${res.statusText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createLink(input: CreateLinkInput): Promise<CreateLinkResponse> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: CreateLinkResponse = await res.json();
  if (!res.ok && !data.duplicate) {
    throw new Error(data.error || "Failed to create short link");
  }

  return data;
}

export async function deleteLink(id: string): Promise<DeleteLinkResponse> {
  const res = await fetch(`/api/links/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete link: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchLinkAnalytics(id: string): Promise<LinkAnalyticsResponse> {
  const res = await fetch(`/api/links/${encodeURIComponent(id)}/analytics`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch analytics: ${res.statusText}`);
  }

  return res.json();
}

