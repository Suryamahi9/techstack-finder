module.exports = {
  apps: [
    {
      name: 'techstack-finder',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/techstack-finder',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/techstack-finder-error.log',
      out_file: '/var/log/techstack-finder-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
