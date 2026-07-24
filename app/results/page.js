'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchBar from '../../components/SearchBar';
import ScanProgress from '../../components/ScanProgress';
import SiteIdentity from '../../components/SiteIdentity';
import SitePreview from '../../components/ScreenshotGallery';
import CompanyProfile from '../../components/CompanyProfile';
import PageMetadata from '../../components/PageMetadata';
import SeoAnalysis from '../../components/SeoAnalysis';
import PerformanceInsights from '../../components/PerformanceInsights';
import SecurityHeaders from '../../components/SecurityHeaders';
import PageWeightAnalysis from '../../components/PageWeightAnalysis';
import CoreWebVitals from '../../components/CoreWebVitals';
import AccessibilityReport from '../../components/AccessibilityReport';
import StackPopularity from '../../components/StackPopularity';
import IndustryBenchmark from '../../components/IndustryBenchmark';
import AiStackSummary from '../../components/AiStackSummary';
import StackRecommendations from '../../components/StackRecommendations';
import AutoCategorization from '../../components/AutoCategorization';
import StackAsCode from '../../components/StackAsCode';
import DesignTokens from '../../components/DesignTokens';
import ThirdPartyAnalysis from '../../components/ThirdPartyAnalysis';
import TechTab from '../../components/TechTab';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import ExportButtons from '../../components/ExportButtons';
import BookmarkButton from '../../components/BookmarkButton';
import ShareButton from '../../components/ShareButton';
import StackScore from '../../components/StackScore';
import VulnerabilityPanel from '../../components/VulnerabilityPanel';
import DnsTlsPanel from '../../components/DnsTlsPanel';
import AdsTxtPanel from '../../components/AdsTxtPanel';
import GdprAudit from '../../components/GdprAudit';
import PartialResultsBanner from '../../components/PartialResultsBanner';

import BadgeDisplay from '../../components/BadgeDisplay';
import EmbedWidget from '../../components/EmbedWidget';
import MultiPageScan from '../../components/MultiPageScan';
import WebhookPanel from '../../components/WebhookPanel';
import WhiteLabelPdf from '../../components/WhiteLabelPdf';
import TechStackGenerator from '../../components/TechStackGenerator';
import ReverseLookup from '../../components/ReverseLookup';
import ResultsTabs from '../../components/ResultsTabs';
import { saveScanTrend } from '../trends/page';
import { saveScanSnapshot } from '../../lib/scan-history';

function ResultsContent() {
  const searchParams = useSearchParams();
  const site = searchParams.get('site');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const customHeaders = searchParams.get('headers');
  const customCookies = searchParams.get('cookies');
  const customProxy = searchParams.get('proxy');

  useEffect(() => {
    if (!site) {
      setError('No site specified.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const body = { url: site };
    if (customHeaders) body.headers = customHeaders;
    if (customCookies) body.cookies = customCookies;
    if (customProxy) body.proxy = customProxy;

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json.success) {
          throw new Error(json.error || `Scan failed (HTTP ${r.status})`);
        }
        return json;
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);

        try {
          const history = JSON.parse(localStorage.getItem('tsf-history') || '[]');
          const filtered = history.filter(
            (h) => h.domain !== result.site.domain
          );
          filtered.unshift({
            domain: result.site.domain,
            url: result.site.url,
            favicon: result.site.favicon,
            scannedAt: result.site.scannedAt,
            total: result.summary.total,
          });
          localStorage.setItem('tsf-history', JSON.stringify(filtered.slice(0, 20)));
          window.dispatchEvent(new Event('tsf-history-updated'));

          const techBreakdown = {};
          const categoryBreakdown = {};
          (result.categories || []).forEach((cat) => {
            categoryBreakdown[cat.category] = cat.technologies.length;
            cat.technologies.forEach((t) => {
              techBreakdown[t.name] = (techBreakdown[t.name] || 0) + 1;
            });
          });
          saveScanTrend({
            domain: result.site.domain,
            url: result.site.url,
            scannedAt: result.site.scannedAt,
            total: result.summary.total,
            frontend: result.summary.frontend || 0,
            backend: result.summary.backend || 0,
            infra: result.summary.infra || 0,
            techBreakdown,
            categoryBreakdown,
          });

          try { saveScanSnapshot(result); } catch {}
        } catch {}
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to scan site.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [site, customHeaders, customCookies, customProxy]);

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="light-bg-art"><div className="art-blob" /><div className="art-blob" /><div className="art-blob" /></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.02] via-transparent to-transparent" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-6 max-w-2xl">
          <SearchBar initialValue={site || ''} size="small" />
        </div>

        {loading && <ScanProgress site={site} />}

        {!loading && error && (
          <div className="animate-fade-up rounded-2xl border border-border bg-elevated p-8 sm:p-12">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg">
                <svg className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Scan failed</h2>
              <p className="mt-2 text-sm text-muted">{error}</p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <a href={`/results?site=${encodeURIComponent(site || '')}`} className="rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium hover:border-border-strong">Try again</a>
                <a href="/" className="text-xs text-muted hover:text-fg">&larr; Back to home</a>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="animate-fade-in">
            {/* Partial results banner */}
            <PartialResultsBanner data={data} />

            {/* Site header — always visible */}
            <div className="mb-4">
              <SiteIdentity site={data.site} summary={data.summary} cached={data.cached} />
            </div>

            <SitePreview url={data.site.url} domain={data.site.domain} />

            {/* Tabs */}
            <ResultsTabs active={activeTab} onChange={setActiveTab} summary={data.summary} />

            {/* ═══ Overview Tab ═══ */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <StackScore seo={data.seo} performance={data.performance} security={data.security} healthScore={data.healthScore} cveSummary={data.cveSummary} dnsTls={data.dnsTls} gdpr={data.gdpr} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {data.dnsTls && <DnsTlsPanel dnsTls={data.dnsTls} />}
                  {data.cveSummary && <VulnerabilityPanel cveSummary={data.cveSummary} versionScores={data.versionScores} />}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {data.adsTxt && <AdsTxtPanel adsTxt={data.adsTxt} />}
                  {data.gdpr && <GdprAudit gdpr={data.gdpr} />}
                </div>

                {data.company && (
                  <CompanyProfile company={data.company} summary={data.summary} categories={data.categories} />
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <AiStackSummary domain={data.site?.domain} categories={data.categories} summary={data.summary} company={data.company} />
                  <AutoCategorization domain={data.site?.domain} categories={data.categories} summary={data.summary} />
                </div>

                {data.pageMetadata && <PageMetadata metadata={data.pageMetadata} />}

                <StackRecommendations categories={data.categories} security={data.security} performance={data.performance} a11y={data.a11y} />

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <BookmarkButton data={data} />
                  <ShareButton site={site} />
                  <DownloadPdfButton data={data} fileName={data.site?.domain || 'report'} />
                  <ExportButtons data={data} fileName={data.site?.domain || 'report'} />
                </div>
              </div>
            )}

            {/* ═══ Technologies Tab ═══ */}
            {activeTab === 'tech' && (
              <TechTab data={data} />
            )}

            {/* ═══ Analysis Tab ═══ */}
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                {data.seo && <SeoAnalysis seo={data.seo} />}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {data.performance && <PerformanceInsights performance={data.performance} />}
                  {data.security && <SecurityHeaders security={data.security} />}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <PageWeightAnalysis pageMetadata={data.pageMetadata} categories={data.categories} seo={data.seo} />
                  {data.a11y && <AccessibilityReport a11y={data.a11y} />}
                </div>

                <CoreWebVitals url={data.site?.url} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <StackPopularity categories={data.categories} />
                  <IndustryBenchmark domain={data.site?.domain} categories={data.categories} />
                </div>

                <ThirdPartyAnalysis categories={data.categories} pageMetadata={data.pageMetadata} />

                {(data.responseHeaders.server || data.responseHeaders.poweredBy || data.responseHeaders.generator) && (
                  <div className="rounded-xl border border-border bg-elevated/40 p-5">
                    <div className="mb-3 font-mono text-xs uppercase tracking-wider text-faint">Response signals</div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
                      {data.responseHeaders.server && (
                        <div><span className="text-faint">Server:</span> <span className="text-muted">{data.responseHeaders.server}</span></div>
                      )}
                      {data.responseHeaders.poweredBy && (
                        <div><span className="text-faint">X-Powered-By:</span> <span className="text-muted">{data.responseHeaders.poweredBy}</span></div>
                      )}
                      {data.responseHeaders.generator && (
                        <div><span className="text-faint">Generator:</span> <span className="text-muted">{data.responseHeaders.generator}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ Code Tab ═══ */}
            {activeTab === 'code' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <StackAsCode categories={data.categories} />
                  <DesignTokens categories={data.categories} pageMetadata={data.pageMetadata} />
                </div>

                <TechStackGenerator />
              </div>
            )}

            {/* ═══ Tools Tab ═══ */}
            {activeTab === 'tools' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <BadgeDisplay domain={data.site?.domain} />
                  <EmbedWidget domain={data.site?.domain} />
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <MultiPageScan domain={data.site?.domain} />
                  <WhiteLabelPdf data={data} />
                </div>

                <ReverseLookup />

                <WebhookPanel data={data} />
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="skeleton h-32 rounded-2xl" />
          </main>
          <Footer />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
