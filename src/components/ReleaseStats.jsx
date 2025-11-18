import { useEffect, useState } from 'react';
import { Download, TrendingUp, Package, Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import {
  fetchReleaseStats,
  getDownloadSummary,
  formatDownloadCount,
  formatFileSize,
  formatReleaseDate
} from '../services/github-stats.js';
import { readConfig, updateConfig } from '../core/config/store.js';

export default function ReleaseStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [releases, setReleases] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [expandedRelease, setExpandedRelease] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
    loadHistoricalData();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const summaryData = await getDownloadSummary();
      setSummary(summaryData);
      setReleases(summaryData.releases);
      setLastUpdated(new Date());

      // Save snapshot for historical tracking
      await saveSnapshot(summaryData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load release stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const config = await readConfig();
      const history = config.releaseStatsHistory || [];
      setHistoricalData(history);
    } catch (err) {
      console.error('Failed to load historical data:', err);
    }
  };

  const saveSnapshot = async (summaryData) => {
    try {
      const config = await readConfig();
      const history = config.releaseStatsHistory || [];

      // Add new snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        totalDownloads: summaryData.totalDownloads,
        totalReleases: summaryData.totalReleases,
        releases: summaryData.releases.map(r => ({
          tag: r.tag,
          downloads: r.totalDownloads
        }))
      };

      // Keep last 100 snapshots
      const updatedHistory = [...history, snapshot].slice(-100);

      await updateConfig({
        releaseStatsHistory: updatedHistory
      });

      setHistoricalData(updatedHistory);
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    }
  };

  const handleRefresh = () => {
    loadStats();
  };

  const toggleReleaseExpand = (releaseId) => {
    setExpandedRelease(expandedRelease === releaseId ? null : releaseId);
  };

  const getDownloadTrend = () => {
    if (historicalData.length < 2) return null;

    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    const change = latest.totalDownloads - previous.totalDownloads;
    const percentChange = ((change / previous.totalDownloads) * 100).toFixed(1);

    return { change, percentChange };
  };

  if (loading && !summary) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'rgb(var(--muted))'
      }}>
        <RefreshCw size={20} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
        Loading release statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        background: 'rgb(var(--destructive) / 0.1)',
        border: '1px solid rgb(var(--destructive) / 0.3)',
        borderRadius: '0.5rem',
        color: 'rgb(var(--destructive))'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Failed to load stats</h4>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>{error}</p>
        <button
          onClick={handleRefresh}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'rgb(var(--destructive))',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const trend = getDownloadTrend();

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          Release Download Statistics
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgb(var(--primary))',
            color: 'rgb(var(--primary-fg))',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: loading ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Downloads */}
        <div style={{
          padding: '1rem',
          background: 'rgb(var(--card))',
          border: '1px solid rgb(var(--border))',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            color: 'rgb(var(--muted))',
            fontSize: '0.875rem'
          }}>
            <Download size={16} />
            <span>Total Downloads</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'rgb(var(--fg))' }}>
            {formatDownloadCount(summary.totalDownloads)}
          </div>
          {trend && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: trend.change >= 0 ? 'rgb(var(--success))' : 'rgb(var(--destructive))'
            }}>
              {trend.change >= 0 ? '+' : ''}{formatDownloadCount(trend.change)} ({trend.percentChange}%)
            </div>
          )}
        </div>

        {/* Total Releases */}
        <div style={{
          padding: '1rem',
          background: 'rgb(var(--card))',
          border: '1px solid rgb(var(--border))',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            color: 'rgb(var(--muted))',
            fontSize: '0.875rem'
          }}>
            <Package size={16} />
            <span>Total Releases</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'rgb(var(--fg))' }}>
            {summary.totalReleases}
          </div>
        </div>

        {/* Latest Release */}
        {summary.latestRelease && (
          <div style={{
            padding: '1rem',
            background: 'rgb(var(--card))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: 'rgb(var(--muted))',
              fontSize: '0.875rem'
            }}>
              <TrendingUp size={16} />
              <span>Latest Release</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'rgb(var(--fg))' }}>
              {summary.latestRelease.tag}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgb(var(--muted))', marginTop: '0.25rem' }}>
              {formatDownloadCount(summary.latestRelease.downloads)} downloads
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div style={{
          fontSize: '0.75rem',
          color: 'rgb(var(--muted))',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Calendar size={12} />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Releases List */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
          All Releases
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {releases.filter(r => !r.draft).map(release => (
            <div
              key={release.id}
              style={{
                background: 'rgb(var(--card))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}
            >
              {/* Release Header */}
              <div
                onClick={() => toggleReleaseExpand(release.id)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  background: expandedRelease === release.id ? 'rgb(var(--accent))' : 'transparent'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      {release.name || release.tag}
                    </span>
                    {release.prerelease && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        background: 'rgb(var(--warning) / 0.2)',
                        color: 'rgb(var(--warning))',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        Pre-release
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'rgb(var(--muted))'
                  }}>
                    {formatReleaseDate(release.published)} • {release.assets.length} asset{release.assets.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'rgb(var(--primary))'
                }}>
                  {formatDownloadCount(release.totalDownloads)}
                </div>
              </div>

              {/* Release Assets (Expanded) */}
              {expandedRelease === release.id && release.assets.length > 0 && (
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid rgb(var(--border))',
                  background: 'rgb(var(--muted) / 0.05)'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Assets
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {release.assets.map(asset => (
                      <div
                        key={asset.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          background: 'rgb(var(--card))',
                          border: '1px solid rgb(var(--border))',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                            {asset.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgb(var(--muted))' }}>
                            {formatFileSize(asset.size)}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontWeight: 600, color: 'rgb(var(--primary))' }}>
                            {formatDownloadCount(asset.downloadCount)}
                          </span>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'rgb(var(--muted))',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Note */}
      {historicalData.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          background: 'rgb(var(--muted) / 0.1)',
          borderRadius: '0.375rem',
          fontSize: '0.8125rem',
          color: 'rgb(var(--muted))'
        }}>
          Tracking {historicalData.length} historical snapshot{historicalData.length !== 1 ? 's' : ''}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
