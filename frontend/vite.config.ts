/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, ProxyOptions } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
/**
 * Premier emplacement existant des libellés du portail (cf. alias @portal-i18n).
 */
const portalI18nPath = () => {
  const rel = 'portal/backend/src/main/resources/i18n/fr.json';
  const candidates = [
    resolve(__dirname, '../../entcore', rel), // actualites cloné à côté d'entcore
    resolve(__dirname, '../../../libs/entcore', rel), // open-ent-mods
  ];
  return (
    candidates.find((p) => existsSync(p)) ??
    resolve(__dirname, 'src/mocks/portal-i18n.fallback.json')
  );
};

export default ({ mode }: { mode: string }) => {
  // Checking environement files
  const envFile = loadEnv(mode, process.cwd());
  const envs = { ...process.env, ...envFile };
  const hasEnvFile = Object.keys(envFile).length;

  // Proxy variables
  const headers = hasEnvFile
    ? {
        'set-cookie': [
          `oneSessionId=${envs.VITE_ONE_SESSION_ID}`,
          `XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        ],
        'Cache-Control': 'public, max-age=300',
      }
    : {};

  const proxyObj: ProxyOptions = hasEnvFile
    ? {
        target: envs.VITE_RECETTE,
        changeOrigin: true,
        headers: {
          cookie: `oneSessionId=${envs.VITE_ONE_SESSION_ID};authenticated=true; XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-XSRF-TOKEN', envs.VITE_XSRF_TOKEN || '');
          });
        },
      }
    : {
        target: 'http://localhost:8090',
        changeOrigin: false,
      };

  // When VITE_MOCK is true, bypass proxy for i18n and actualites endpoints to let MSW handle them
  const isMockMode = envs.VITE_MOCK === 'true';

  // Common proxy configuration
  const commonProxyConfig = {
    '/applications-list': proxyObj,
    '/conf/public': proxyObj,
    '^/(?=help-1d|help-2d)': proxyObj,
    '^/(?=assets)': proxyObj,
    '^/(?=theme|locale|i18n|skin)': proxyObj,
    '^/(?=auth|appregistry|cas|userbook|directory|communication|conversation|portal|session|timeline|workspace|infra)':
      proxyObj,
    '/explorer': proxyObj,
    '/audience': proxyObj,
  };

  // In mock mode, don't proxy /actualites and /i18n - MSW will handle them
  const proxyConfig = isMockMode
    ? commonProxyConfig
    : {
        ...commonProxyConfig,
        '/actualites': proxyObj,
      };

  return defineConfig({
    base: mode === 'production' ? '/actualites' : '',
    root: __dirname,
    cacheDir: './node_modules/.vite/actualites',

    resolve: {
      dedupe: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'react-i18next',
        'i18next',
        '@react-spring/web',
        'react-hook-form',
        'react-router-dom',
        '@open-ent/client',
        '@open-ent/react',
        '@open-ent/bootstrap',
        '@open-ent/utilities',
      ],
      alias: {
        '@images': resolve(
          __dirname,
          'node_modules/@open-ent/bootstrap/dist/images',
        ),
        // Libellés du portail, servis par le mock /i18n. Ils vivent dans entcore,
        // hors de ce dépôt, et son emplacement dépend de l'agencement : à côté
        // d'actualites en clone isolé, sous libs/ dans open-ent-mods, et absent
        // en CI (le workflow ne sort que ce dépôt). Un import relatif en dur ne
        // peut donc pas convenir partout : on résout ici, avec repli sur un stub
        // vide, sinon les 14 fichiers de test échouent au chargement.
        '@portal-i18n': portalI18nPath(),
      },
    },

    server: {
      fs: {
        /**
         * Allow the server to access the node_modules folder (for the images)
         * This is a solution to allow the server to access the images and fonts of the bootstrap package for 1D theme
         */
        allow: ['../../'],
      },
      proxy: proxyConfig,
      port: 4200,
      headers,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      headers,
      host: 'localhost',
    },

    plugins: [react(), tsconfigPaths()],

    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      assetsDir: 'public',
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },

    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['./src/mocks/setup.ts'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: './coverage/actualites',
        provider: 'v8',
      },
      server: {
        deps: {
          inline: ['@open-ent/react'],
        },
      },
    },
  });
};
