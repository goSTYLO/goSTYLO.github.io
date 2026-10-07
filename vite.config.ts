import { copyFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import {
  assertPortfolioDocumentReady,
  buildLlmsTxt,
  buildPortfolioCrawlerOutlineHtml,
  buildPortfolioHeadHtml,
} from './src/data/portfolioDocument';
function portfolioDocumentPlugin(): Plugin {
  assertPortfolioDocumentReady();

  const syncPublicArtifacts = () => {
    writeFileSync('public/llms.txt', buildLlmsTxt(), 'utf8');
    copyFileSync(
      'assets/AARON AST friendly resume with portfolio.pdf',
      'public/cv/aaron-tamayo-resume.pdf',
    );
  };

  return {
    name: 'portfolio-document',
    buildStart() {
      syncPublicArtifacts();
    },
    transformIndexHtml(html) {
      return html
        .replace('<!-- PORTFOLIO_HEAD_INJECT -->', buildPortfolioHeadHtml())
        .replace('<!-- PORTFOLIO_CRAWLER_OUTLINE_INJECT -->', buildPortfolioCrawlerOutlineHtml());
    },
    closeBundle() {
      writeFileSync('dist/llms.txt', buildLlmsTxt(), 'utf8');
      copyFileSync('docs/myResume.md', 'dist/resume.md');
    },
  };
}

export default defineConfig({
  plugins: [react(), portfolioDocumentPlugin()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
