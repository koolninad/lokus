/**
 * GitHub Release Stats Service
 *
 * Fetches and tracks download statistics for GitHub releases
 */

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'lokus-ai';
const REPO_NAME = 'lokus';

/**
 * Fetch all releases with download statistics
 * @returns {Promise<Array>} Array of releases with download counts
 */
export async function fetchReleaseStats() {
  try {
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const releases = await response.json();

    // Process releases to extract download stats
    return releases.map(release => {
      const totalDownloads = release.assets.reduce(
        (sum, asset) => sum + asset.download_count,
        0
      );

      return {
        id: release.id,
        name: release.name,
        tag: release.tag_name,
        published: release.published_at,
        prerelease: release.prerelease,
        draft: release.draft,
        totalDownloads,
        assets: release.assets.map(asset => ({
          name: asset.name,
          size: asset.size,
          downloadCount: asset.download_count,
          created: asset.created_at,
          updated: asset.updated_at,
          url: asset.browser_download_url
        }))
      };
    });
  } catch (error) {
    console.error('Failed to fetch GitHub release stats:', error);
    throw error;
  }
}

/**
 * Fetch stats for a specific release
 * @param {string} tagName - Release tag name
 * @returns {Promise<Object>} Release stats
 */
export async function fetchReleaseByTag(tagName) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tagName}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const release = await response.json();

    const totalDownloads = release.assets.reduce(
      (sum, asset) => sum + asset.download_count,
      0
    );

    return {
      id: release.id,
      name: release.name,
      tag: release.tag_name,
      published: release.published_at,
      prerelease: release.prerelease,
      draft: release.draft,
      totalDownloads,
      assets: release.assets.map(asset => ({
        name: asset.name,
        size: asset.size,
        downloadCount: asset.download_count,
        created: asset.created_at,
        updated: asset.updated_at,
        url: asset.browser_download_url
      }))
    };
  } catch (error) {
    console.error(`Failed to fetch release ${tagName}:`, error);
    throw error;
  }
}

/**
 * Get total downloads across all releases
 * @returns {Promise<number>} Total download count
 */
export async function getTotalDownloads() {
  try {
    const releases = await fetchReleaseStats();
    return releases.reduce((sum, release) => sum + release.totalDownloads, 0);
  } catch (error) {
    console.error('Failed to get total downloads:', error);
    return 0;
  }
}

/**
 * Get download statistics summary
 * @returns {Promise<Object>} Statistics summary
 */
export async function getDownloadSummary() {
  try {
    const releases = await fetchReleaseStats();

    const totalDownloads = releases.reduce(
      (sum, release) => sum + release.totalDownloads,
      0
    );

    const latestRelease = releases.find(r => !r.prerelease && !r.draft);
    const mostDownloaded = [...releases].sort(
      (a, b) => b.totalDownloads - a.totalDownloads
    )[0];

    return {
      totalDownloads,
      totalReleases: releases.length,
      latestRelease: latestRelease ? {
        name: latestRelease.name,
        tag: latestRelease.tag,
        downloads: latestRelease.totalDownloads,
        published: latestRelease.published
      } : null,
      mostDownloaded: mostDownloaded ? {
        name: mostDownloaded.name,
        tag: mostDownloaded.tag,
        downloads: mostDownloaded.totalDownloads,
        published: mostDownloaded.published
      } : null,
      releases
    };
  } catch (error) {
    console.error('Failed to get download summary:', error);
    throw error;
  }
}

/**
 * Format download count with K/M suffixes
 * @param {number} count - Download count
 * @returns {string} Formatted count
 */
export function formatDownloadCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  return bytes + ' B';
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatReleaseDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
