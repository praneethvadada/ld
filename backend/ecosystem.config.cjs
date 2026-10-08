// PM2 process file:  pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'ganesh-lucky-draw-api',
      script: 'src/server.js',
      cwd: __dirname,
      // Rate-limit counters are kept in memory, so keep this at a single process.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
