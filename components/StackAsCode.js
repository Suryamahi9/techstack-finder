'use client';
import { useState, useMemo } from 'react';

const DOCKER_MAP = {
  'Node.js': { image: 'node:20-alpine', service: 'node', ports: ['3000:3000'] },
  'Express': { image: 'node:20-alpine', service: 'express', ports: ['3000:3000'] },
  'Django': { image: 'python:3.12-slim', service: 'django', ports: ['8000:8000'] },
  'Flask': { image: 'python:3.12-slim', service: 'flask', ports: ['5000:5000'] },
  'FastAPI': { image: 'python:3.12-slim', service: 'fastapi', ports: ['8000:8000'] },
  'Laravel': { image: 'php:8.3-apache', service: 'laravel', ports: ['8080:80'] },
  'Ruby on Rails': { image: 'ruby:3.3-slim', service: 'rails', ports: ['3000:3000'] },
  'Spring Boot': { image: 'eclipse-temurin:21-jre', service: 'spring', ports: ['8080:8080'] },
  'MySQL': { image: 'mysql:8.0', service: 'mysql', ports: ['3306:3306'], env: { MYSQL_ROOT_PASSWORD: 'secret', MYSQL_DATABASE: 'app' } },
  'PostgreSQL': { image: 'postgres:16-alpine', service: 'postgres', ports: ['5432:5432'], env: { POSTGRES_PASSWORD: 'secret', POSTGRES_DB: 'app' } },
  'MongoDB': { image: 'mongo:7', service: 'mongo', ports: ['27017:27017'] },
  'Redis': { image: 'redis:7-alpine', service: 'redis', ports: ['6379:6379'] },
  'Nginx': { image: 'nginx:alpine', service: 'nginx', ports: ['80:80', '443:443'] },
  'WordPress': { image: 'wordpress:latest', service: 'wordpress', ports: ['8080:80'], env: { WORDPRESS_DB_HOST: 'mysql', WORDPRESS_DB_USER: 'root', WORDPRESS_DB_PASSWORD: 'secret' } },
  'Elasticsearch': { image: 'elasticsearch:8.12.0', service: 'elasticsearch', ports: ['9200:9200'], env: { discovery_type: 'single-node', 'xpack.security.enabled': 'false' } },
};

const TERRAFORM_MAP = {
  'Vercel': { resource: 'vercel_project', provider: 'vercel' },
  'Netlify': { resource: 'netlify_site', provider: 'netlify' },
  'AWS': { resource: 'aws_instance', provider: 'aws' },
  'Cloudflare': { resource: 'cloudflare_zone', provider: 'cloudflare' },
  'Firebase': { resource: 'firebase_project', provider: 'firebase' },
  'Docker': { resource: 'docker_container', provider: 'docker' },
  'Kubernetes': { resource: 'kubernetes_deployment', provider: 'kubernetes' },
  'Stripe': { resource: 'stripe_product', provider: 'stripe' },
  'Supabase': { resource: 'supabase_project', provider: 'supabase' },
};

function generateDockerCompose(categories) {
  const services = {};
  categories?.forEach((cat) => {
    cat.technologies.forEach((t) => {
      const mapping = DOCKER_MAP[t.name];
      if (mapping) {
        services[mapping.service] = {
          image: mapping.image,
          ports: mapping.ports,
          ...(mapping.env ? { environment: mapping.env } : {}),
          restart: 'unless-stopped',
        };
      }
    });
  });

  if (Object.keys(services).length === 0) return null;

  let yaml = 'version: "3.8"\nservices:\n';
  Object.entries(services).forEach(([name, svc]) => {
    yaml += `  ${name}:\n`;
    yaml += `    image: ${svc.image}\n`;
    if (svc.ports) yaml += `    ports:\n${svc.ports.map((p) => `      - "${p}"`).join('\n')}\n`;
    if (svc.environment) {
      yaml += `    environment:\n`;
      Object.entries(svc.environment).forEach(([k, v]) => {
        yaml += `      ${k}: ${v}\n`;
      });
    }
    yaml += `    restart: ${svc.restart}\n\n`;
  });
  return yaml.trim();
}

function generatePackageJson(categories) {
  const deps = {};
  const devDeps = {};

  const PKG_NAMES = {
    'Next.js': { name: 'next', deps: true },
    'React': { name: 'react', deps: true },
    'Vue.js': { name: 'vue', deps: true },
    'Angular': { name: '@angular/core', deps: true },
    'Svelte': { name: 'svelte', deps: true },
    'Tailwind CSS': { name: 'tailwindcss', devDeps: true },
    'Bootstrap': { name: 'bootstrap', deps: true },
    'TypeScript': { name: 'typescript', devDeps: true },
    'Webpack': { name: 'webpack', devDeps: true },
    'Vite': { name: 'vite', devDeps: true },
    'Jest': { name: 'jest', devDeps: true },
    'Cypress': { name: 'cypress', devDeps: true },
    'Playwright': { name: '@playwright/test', devDeps: true },
    'ESLint': { name: 'eslint', devDeps: true },
    'Prettier': { name: 'prettier', devDeps: true },
    'Axios': { name: 'axios', deps: true },
    'Lodash': { name: 'lodash', deps: true },
    'jQuery': { name: 'jquery', deps: true },
    'Express': { name: 'express', deps: true },
    'Prisma': { name: '@prisma/client', deps: true },
    'NextAuth.js': { name: 'next-auth', deps: true },
    'Storybook': { name: 'storybook', devDeps: true },
    'Framer Motion': { name: 'framer-motion', deps: true },
    'Three.js': { name: 'three', deps: true },
    'D3.js': { name: 'd3', deps: true },
    'GSAP': { name: 'gsap', deps: true },
    'Day.js': { name: 'dayjs', deps: true },
    'Sentry': { name: '@sentry/nextjs', deps: true },
    'Nuxt': { name: 'nuxt', deps: true },
    'Gatsby': { name: 'gatsby', deps: true },
    'Remix': { name: '@remix-run/react', deps: true },
    'Astro': { name: 'astro', deps: true },
    'esbuild': { name: 'esbuild', devDeps: true },
    'Parcel': { name: 'parcel', devDeps: true },
    'Turborepo': { name: 'turbo', devDeps: true },
    'Strapi': { name: '@strapi/strapi', deps: true },
    'Firebase Auth': { name: 'firebase', deps: true },
    'Clerk': { name: '@clerk/nextjs', deps: true },
    'Auth0': { name: '@auth0/nextjs-auth0', deps: true },
  };

  categories?.forEach((cat) => {
    cat.technologies.forEach((t) => {
      const mapping = PKG_NAMES[t.name];
      if (mapping) {
        if (mapping.deps) deps[mapping.name] = 'latest';
        if (mapping.devDeps) devDeps[mapping.name] = 'latest';
      }
    });
  });

  if (Object.keys(deps).length === 0 && Object.keys(devDeps).length === 0) return null;

  const pkg = {
    name: 'detected-stack',
    version: '1.0.0',
    private: true,
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: deps,
    devDependencies: devDeps,
  };

  return JSON.stringify(pkg, null, 2);
}

function generateTerraform(categories) {
  const providers = {};
  categories?.forEach((cat) => {
    cat.technologies.forEach((t) => {
      const mapping = TERRAFORM_MAP[t.name];
      if (mapping) {
        providers[mapping.provider] = true;
      }
    });
  });

  if (Object.keys(providers).length === 0) return null;

  let tf = 'terraform {\n  required_version = ">= 1.0"\n\n';
  tf += '  required_providers {\n';
  Object.keys(providers).forEach((p) => {
    tf += `    ${p} = {\n      source  = "hashicorp/${p}"\n      version = "~> 1.0"\n    }\n`;
  });
  tf += '  }\n}\n\n';

  Object.keys(providers).forEach((p) => {
    tf += `provider "${p}" {\n  # Configure here\n}\n\n`;
  });

  return tf.trim();
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-border bg-bg/80 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[10px] text-faint">{language}</span>
        <button
          onClick={copy}
          className="rounded-md px-2 py-0.5 text-[10px] font-medium text-muted hover:text-fg transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function StackAsCode({ categories }) {
  const [activeTab, setActiveTab] = useState('docker');

  const dockerCompose = useMemo(() => generateDockerCompose(categories), [categories]);
  const packageJson = useMemo(() => generatePackageJson(categories), [categories]);
  const terraform = useMemo(() => generateTerraform(categories), [categories]);

  const tabs = [
    { id: 'docker', label: 'Docker Compose', available: !!dockerCompose },
    { id: 'package', label: 'package.json', available: !!packageJson },
    { id: 'terraform', label: 'Terraform', available: !!terraform },
  ];

  const availableTabs = tabs.filter((t) => t.available);
  if (availableTabs.length === 0) return null;

  const code = activeTab === 'docker' ? dockerCompose : activeTab === 'package' ? packageJson : terraform;
  const lang = activeTab === 'docker' ? 'yaml' : activeTab === 'package' ? 'json' : 'hcl';

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Stack as Code</h3>
      </div>

      <div className="mb-3 flex gap-1.5">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'text-faint hover:text-muted border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {code && <CodeBlock code={code} language={lang} />}
    </div>
  );
}
