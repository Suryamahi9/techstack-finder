'use client';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import ExportDashboard from '../../components/ExportDashboard';
import BookmarkButton from '../../components/BookmarkButton';
import ShareButton from '../../components/ShareButton';
import StackScore from '../../components/StackScore';
import VulnerabilityPanel from '../../components/VulnerabilityPanel';
import DnsTlsPanel from '../../components/DnsTlsPanel';
import AdsTxtPanel from '../../components/AdsTxtPanel';
import GdprAudit from '../../components/GdprAudit';
import PartialResultsBanner from '../../components/PartialResultsBanner';
import AiInsights from '../../components/AiInsights';
import ImpliedTechs from '../../components/ImpliedTechs';
import IndustryBadge from '../../components/IndustryBadge';
import AiBuilderBadge from '../../components/AiBuilderBadge';
import CanonicalTechs from '../../components/CanonicalTechs';
import MarketTrends from '../../components/MarketTrends';
import HistoricalAdoption from '../../components/HistoricalAdoption';
import CompanyEnrichment from '../../components/CompanyEnrichment';
import JobInference from '../../components/JobInference';
import CostEstimator from '../../components/CostEstimator';
import TechLifecycle from '../../components/TechLifecycle';
import ComplexityScore from '../../components/ComplexityScore';
import OpenSourceAlts from '../../components/OpenSourceAlts';
import StackFingerprint from '../../components/StackFingerprint';
import TeamEstimator from '../../components/TeamEstimator';
import TechDebtDetector from '../../components/TechDebtDetector';
import MigrationPath from '../../components/MigrationPath';
import CompetitorRadar from '../../components/CompetitorRadar';
import StackHealthTimeline from '../../components/StackHealthTimeline';

import BadgeDisplay from '../../components/BadgeDisplay';
import EmbedWidget from '../../components/EmbedWidget';
import MultiPageScan from '../../components/MultiPageScan';
import WebhookPanel from '../../components/WebhookPanel';
import WhiteLabelPdf from '../../components/WhiteLabelPdf';
import TechStackGenerator from '../../components/TechStackGenerator';
import ReverseLookup from '../../components/ReverseLookup';
import SectionGroup from '../../components/SectionGroup';
import ResultsTabs from '../../components/ResultsTabs';
import CompareDropZone from '../../components/CompareDropZone';
import { saveScanTrend } from '../../lib/scan-trends';
import { saveScanSnapshot } from '../../lib/scan-history';

function ResultsContent() {
  const searchParams = useSearchParams();
  const site = searchParams.get('site');
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cancelled, setCancelled] = useState(false);
  const abortRef = useRef(null);

  const customHeaders = searchParams.get('headers');
  const customCookies = searchParams.get('cookies');
  const customProxy = searchParams.get('proxy');

  useEffect(() => {
    if (!site) {
      setError('No site specified.');
      setLoading(false);
      return;
    }

    setCancelled(false);
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const body = { url: site };
    if (customHeaders) body.headers = customHeaders;
    if (customCookies) body.cookies = customCookies;
    if (customProxy) body.proxy = customProxy;

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
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
        if (!cancelled) setError(err.name === 'AbortError' ? 'Scan cancelled.' : err.message || 'Failed to scan site.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        abortRef.current = null;
      });

    return () => {
      cancelled = true;
      controller.abort();
      abortRef.current = null;
    };
  }, [site, customHeaders, customCookies, customProxy]);

  const handleCancel = useCallback(() => {
    setCancelled(true);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
    setError('Scan cancelled.');
  }, []);

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.02] via-transparent to-transparent" />
      </div>

      <main id="main-content" className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-all duration-300 hover:border-accent/20 hover:text-fg active:scale-95" aria-label="Back to home">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-1">
            <SearchBar initialValue={site || ''} size="small" />
          </div>
        </div>

        {loading && <ScanProgress site={site} onCancel={handleCancel} />}

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

                {/* ─────── Stack & Technologies ─────── */}
                <SectionGroup title="Stack & Technologies" badge={data.summary?.total} defaultOpen icon={<><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></>}>
                  <TechTab data={data} />
                </SectionGroup>

                {/* ─────── Security & Compliance ─────── */}
                <SectionGroup title="Security & Compliance" defaultOpen icon={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></>}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.dnsTls && <DnsTlsPanel dnsTls={data.dnsTls} />}
                      {data.cveSummary && <VulnerabilityPanel cveSummary={data.cveSummary} versionScores={data.versionScores} />}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.adsTxt && <AdsTxtPanel adsTxt={data.adsTxt} />}
                      {data.gdpr && <GdprAudit gdpr={data.gdpr} />}
                    </div>
                  </div>
                </SectionGroup>

                {/* ─────── Performance & SEO ─────── */}
                <SectionGroup title="Performance & SEO" icon={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.seo && <SeoAnalysis seo={data.seo} />}
                      {data.performance && <PerformanceInsights performance={data.performance} />}
                    </div>
                    {data.security && <SecurityHeaders security={data.security} />}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <PageWeightAnalysis pageMetadata={data.pageMetadata} categories={data.categories} seo={data.seo} />
                      {data.a11y && <AccessibilityReport a11y={data.a11y} />}
                    </div>
                    <CoreWebVitals url={data.site?.url} />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <StackPopularity categories={data.categories} />
                      <IndustryBenchmark domain={data.site?.domain} categories={data.categories} />
                    </div>
                    <ThirdPartyAnalysis categories={data.categories} pageMetadata={data.pageMetadata} />
                  </div>
                </SectionGroup>

                {/* ─────── Business Intelligence ─────── */}
                <SectionGroup title="Business Intelligence" icon={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>}>
                  <div className="space-y-6">
                    {(data.jobInference || data.stackInference) && (
                      <JobInference jobInference={data.jobInference} stackInference={data.stackInference} />
                    )}
                    {data.company && <CompanyEnrichment company={data.company} />}
                    {data.company && (
                      <CompanyProfile company={data.company} summary={data.summary} categories={data.categories} />
                    )}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <MarketTrends technologies={data.technologies} />
                      <HistoricalAdoption technologies={data.technologies} />
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <AiStackSummary domain={data.site?.domain} categories={data.categories} summary={data.summary} company={data.company} />
                      <AutoCategorization domain={data.site?.domain} categories={data.categories} summary={data.summary} />
                    </div>
                    {data.canonicalTechs && <CanonicalTechs technologies={data.canonicalTechs} />}
                    {data.impliedTechs && data.impliedTechs.length > 0 && (
                      <ImpliedTechs implied={data.impliedTechs} />
                    )}
                    {data.industry && <IndustryBadge industry={data.industry} />}
                    {data.insights && <AiInsights insights={data.insights} />}
                    {data.aiBuilders && data.aiBuilders.length > 0 && (
                      <AiBuilderBadge builders={data.aiBuilders} />
                    )}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.lifecycle && <TechLifecycle lifecycle={data.lifecycle} />}
                      {data.techDebt && <TechDebtDetector techDebt={data.techDebt} />}
                    </div>
                  </div>
                </SectionGroup>

                {/* ─────── Recommendations & Migration ─────── */}
                <SectionGroup title="Recommendations & Stack Health" icon={<><path d="M12 20V10"/><path d="M18 20V5"/><path d="M6 20v-4"/></>}>
                  <div className="space-y-6">
                    <StackRecommendations categories={data.categories} security={data.security} performance={data.performance} a11y={data.a11y} />
                    <StackHealthTimeline domain={data.site?.domain} currentScore={data.healthScore} />
                    {data.openSourceAlts && data.openSourceAlts.alternatives.length > 0 && (
                      <OpenSourceAlts alternatives={data.openSourceAlts} />
                    )}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.costEstimate && <CostEstimator costEstimate={data.costEstimate} />}
                      {data.complexity && <ComplexityScore complexity={data.complexity} />}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.teamEstimate && <TeamEstimator teamEstimate={data.teamEstimate} />}
                      {data.migrationData && data.migrationData.migrations.length > 0 && <MigrationPath migrationData={data.migrationData} />}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {data.competitorRadar && <CompetitorRadar radar={data.competitorRadar} />}
                      {data.fingerprint && <StackFingerprint fingerprint={data.fingerprint} />}
                    </div>
                    {data.pageMetadata && <PageMetadata metadata={data.pageMetadata} />}
                  </div>
                </SectionGroup>

                {/* ─────── Action Bar ─────── */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <BookmarkButton data={data} />
                  <ShareButton site={site} />
                  <DownloadPdfButton data={data} fileName={data.site?.domain || 'report'} />
                  <ExportDashboard data={data} fileName={data.site?.domain || 'report'} />
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
                <div className="rounded-xl border border-border bg-elevated/40 p-6 text-center">
                  <p className="text-sm text-muted">
                    Detailed analysis reports are now available in the Overview tab under
                    <span className="mx-1.5 font-medium text-fg">Performance &amp; SEO</span>
                    and
                    <span className="mx-1.5 font-medium text-fg">Security &amp; Compliance</span>
                    sections.
                  </p>
                </div>

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
      <CompareDropZone />
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
