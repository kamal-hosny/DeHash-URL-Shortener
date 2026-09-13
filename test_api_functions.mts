import { getLinkByIdOrShortCode, getLinkAnalyticsData, getStoredLinks } from "./lib/storage/links";

async function test() {
  console.log("=== Testing getStoredLinks() ===");
  const links = await getStoredLinks();
  console.log("Total stored links returned:", links.length);
  console.log("Links sample:", links.slice(0, 4).map(l => ({ id: l.id, name: l.name, shortCode: l.shortCode, clicks: l.clicks })));

  console.log("\n=== Testing getLinkByIdOrShortCode() ===");
  // Test by local ID 'g9nj8sbna'
  const byLocalId = await getLinkByIdOrShortCode("g9nj8sbna");
  console.log("Found by local ID 'g9nj8sbna':", byLocalId?.shortCode, byLocalId?.name);

  // Test by shortCode '4rtxf5'
  const byCode = await getLinkByIdOrShortCode("4rtxf5");
  console.log("Found by shortCode '4rtxf5':", byCode?.shortCode, byCode?.name);

  console.log("\n=== Testing getLinkAnalyticsData('4rtxf5') ===");
  const analytics = await getLinkAnalyticsData("4rtxf5");
  console.log("Analytics result:");
  console.log("- Total Clicks:", analytics?.totalClicks);
  console.log("- Unique Visitors:", analytics?.uniqueVisitors);
  console.log("- Location Data:", analytics?.locationData);
  console.log("- Device Data:", analytics?.deviceData);
  console.log("- Browser Data:", analytics?.browserData);
  console.log("- Referrer Data:", analytics?.referrerData);
  console.log("- Recent Clicks count:", analytics?.recentClicks?.length);
  console.log("- First Recent Click:", analytics?.recentClicks?.[0]);
}

test().catch(console.error);

