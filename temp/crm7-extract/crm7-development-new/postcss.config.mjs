import { env } from 'node:process';

const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    autoprefixer: {},
    ...(env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        }
      : {}),
  },
};

export default config;
