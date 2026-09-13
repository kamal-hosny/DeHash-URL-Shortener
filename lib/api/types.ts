import { Link } from "@/store/linkStore";

export interface CreateLinkInput {
  originalUrl: string;
  name?: string;
  shortCode?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  link?: Link;
  duplicate?: boolean;
  error?: string;
}

export interface DeleteLinkResponse {
  success: boolean;
  error?: string;
}

export interface ClickItem {
  id: string;
  clickedAt: string;
  country?: string | null;
  city?: string | null;
  referrer?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
  shortCode?: string;
  linkName?: string;
}

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export interface LinkAnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topSource: string;
  deviceData: ChartDatum[];
  browserData: ChartDatum[];
  locationData: ChartDatum[];
  referrerData: ChartDatum[];
  recentClicks: ClickItem[];
}

export interface LinkAnalyticsResponse {
  success: boolean;
  link?: Link;
  analytics?: LinkAnalyticsData;
  error?: string;
}

export interface TopLinkItem {
  id: string;
  name?: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  topCountry?: string;
  topReferrer?: string;
  isActive: boolean;
}

export interface AggregateAnalyticsResponse {
  success: boolean;
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  topSource: string;
  topCountry: string;
  locationData: ChartDatum[];
  deviceData: ChartDatum[];
  browserData: ChartDatum[];
  referrerData: ChartDatum[];
  topLinks?: TopLinkItem[];
  recentClicks?: ClickItem[];
  error?: string;
}

