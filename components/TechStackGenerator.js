'use client';
import { useState } from 'react';

const STACKS = {
  'Next.js Full Stack': {
    description: 'Production-ready Next.js with database, auth, and deployment',
    files: {
      'package.json': JSON.stringify({ name: 'my-app', version: '0.1.0', private: true, scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' }, dependencies: { next: '14.2.0', react: '^18', 'react-dom': '^18', 'next-auth': '^4', '@prisma/client': '^5', tailwindcss: '^3.4', autoprefixer: '^10', postcss: '^8', prisma: '^5', '@sentry/nextjs': '^8' }, devDependencies: { typescript: '^5', '@types/node': '^20', '@types/react': '^18', eslint: '^8', 'eslint-config-next': '14.2.0' } }, null, 2),
      'next.config.js': '/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n  images: {\n    remotePatterns: [\n      { protocol: \'https\', hostname: \'**\' },\n    ],\n  },\n};\n\nmodule.exports = nextConfig;',
      'tailwind.config.js': '/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = {\n  content: [\n    \'./app/**/*.{js,ts,jsx,tsx,mdx}\',\n    \'./components/**/*.{js,ts,jsx,tsx,mdx}\',\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};',
      'app/layout.js': 'import \'./globals.css\';\n\nexport const metadata = {\n  title: \'My App\',\n  description: \'Built with Next.js\',\n};\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}',
      'app/page.js': 'export default function Home() {\n  return (\n    <main className="flex min-h-screen flex-col items-center justify-center p-24">\n      <h1 className="text-4xl font-bold">Welcome to Next.js</h1>\n      <p className="mt-4 text-lg text-gray-600">Get started by editing app/page.js</p>\n    </main>\n  );\n}',
      'app/globals.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground: #000;\n  --background: #fff;\n}\n\nbody {\n  color: var(--foreground);\n  background: var(--background);\n}',
      'prisma/schema.prisma': 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String?\n  createdAt DateTime @default(now())\n}',
    },
  },
  'Vite + React': {
    description: 'Fast React app with Vite, TypeScript, and Tailwind',
    files: {
      'package.json': JSON.stringify({ name: 'my-react-app', version: '0.1.0', private: true, type: 'module', scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' }, dependencies: { react: '^18', 'react-dom': '^18' }, devDependencies: { vite: '^5', '@vitejs/plugin-react': '^4', tailwindcss: '^3.4', autoprefixer: '^10', postcss: '^8', typescript: '^5', '@types/react': '^18', '@types/react-dom': '^18' } }, null, 2),
      'vite.config.js': 'import { defineConfig } from \'vite\';\nimport react from \'@vitejs/plugin-react\';\n\nexport default defineConfig({\n  plugins: [react()],\n});',
      'index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vite + React</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>',
      'src/main.jsx': 'import React from \'react\';\nimport ReactDOM from \'react-dom/client\';\nimport App from \'./App\';\nimport \'./index.css\';\n\nReactDOM.createRoot(document.getElementById(\'root\')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);',
      'src/App.jsx': 'export default function App() {\n  return (\n    <div className="flex min-h-screen items-center justify-center">\n      <h1 className="text-4xl font-bold">Hello React + Vite</h1>\n    </div>\n  );\n}',
      'src/index.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
    },
  },
  'Django + React': {
    description: 'Python backend with React frontend',
    files: {
      'requirements.txt': 'Django>=4.2\ndjangorestframework\ndjango-cors-headers\npsycopg2-binary\npython-decouple',
      'manage.py': '#!/usr/bin/env python\nimport os\nimport sys\n\ndef main():\n    os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'config.settings\')\n    try:\n        from django.core.management import execute_from_command_line\n    except ImportError as exc:\n        raise ImportError("Django not installed.") from exc\n    execute_from_command_line(sys.argv)\n\nif __name__ == \'__main__\':\n    main()',
      'config/settings.py': 'INSTALLED_APPS = [\n    \'django.contrib.admin\',\n    \'django.contrib.auth\',\n    \'django.contrib.contenttypes\',\n    \'rest_framework\',\n    \'corsheaders\',\n    \'api\',\n]',
      'api/views.py': 'from rest_framework.decorators import api_view\nfrom rest_framework.response import Response\n\n@api_view([\'GET\'])\ndef health(request):\n    return Response({\'status\": \'ok\'})',
    },
  },
  'Astro + Tailwind': {
    description: 'Static site with Astro islands and Tailwind',
    files: {
      'package.json': JSON.stringify({ name: 'my-astro-site', type: 'module', scripts: { dev: 'astro dev', build: 'astro build', preview: 'astro preview' }, dependencies: { astro: '^4', '@astrojs/tailwind': '^5', tailwindcss: '^3.4' } }, null, 2),
      'astro.config.mjs': 'import { defineConfig } from \'astro/config\';\nimport tailwind from \'@astrojs/tailwind\';\n\nexport default defineConfig({\n  integrations: [tailwind()],\n});',
      'src/pages/index.astro': '---\nconst title = "My Astro Site";\n---\n\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width" />\n    <title>{title}</title>\n  </head>\n  <body>\n    <main class="flex min-h-screen items-center justify-center">\n      <h1 class="text-4xl font-bold">{title}</h1>\n    </main>\n  </body>\n</html>',
    },
  },
  'SvelteKit': {
    description: 'Full-stack Svelte with SvelteKit routing',
    files: {
      'package.json': JSON.stringify({ name: 'my-sveltekit-app', type: 'module', scripts: { dev: 'vite dev', build: 'vite build', preview: 'vite preview' }, dependencies: { '@sveltejs/kit': '^2', svelte: '^4', vite: '^5' } }, null, 2),
      'svelte.config.js': 'import adapter from \'@sveltejs/adapter-auto\';\n\nexport default {\n  kit: {\n    adapter: adapter(),\n  },\n};',
      'src/routes/+page.svelte': '<script>\n  let count = 0;\n</script>\n\n<main class="flex min-h-screen items-center justify-center">\n  <div class="text-center">\n    <h1 class="text-4xl font-bold">Welcome to SvelteKit</h1>\n    <button\n      class="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white"\n      on:click={() => count++}\n    >\n      Count: {count}\n    </button>\n  </div>\n</main>',
    },
  },
};

function CodePreview({ files, activeFile }) {
  const code = files[activeFile] || '';
  return (
    <div className="rounded-xl border border-border bg-bg/80 overflow-hidden">
      <div className="border-b border-border px-3 py-1.5">
        <span className="font-mono text-[10px] text-faint">{activeFile}</span>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-muted max-h-[300px] overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function TechStackGenerator() {
  const [selected, setSelected] = useState('Next.js Full Stack');
  const [activeFile, setActiveFile] = useState(null);

  const stack = STACKS[selected];
  const files = Object.keys(stack.files);
  const currentFile = activeFile || files[0];

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Stack Generator</h3>
      </div>
      <p className="mb-3 text-[11px] text-muted">Generate a starter project for any detected stack.</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.entries(STACKS).map(([name, s]) => (
          <button
            key={name}
            onClick={() => { setSelected(name); setActiveFile(null); }}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              selected === name ? 'bg-accent/10 text-accent border border-accent/30' : 'text-faint border border-transparent'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="mb-3 text-[11px] text-muted">{stack.description}</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {files.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFile(f)}
            className={`rounded-md px-2 py-1 font-mono text-[10px] transition-all ${
              currentFile === f ? 'bg-accent/15 text-accent' : 'text-faint hover:text-muted'
            }`}
          >
            {f.split('/').pop()}
          </button>
        ))}
      </div>
      <CodePreview files={stack.files} activeFile={currentFile} />
    </div>
  );
}
