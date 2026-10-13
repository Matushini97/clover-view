import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  viteFinal: (config) => {
    // Для GitHub Pages путь задаётся через STORYBOOK_BASE (например, /clover-view/).
    // './' по умолчанию — работает и локально, и в поддиректории Pages.
    config.base = process.env.STORYBOOK_BASE ?? './';
    return config;
  },
};
export default config;
