module.exports = {
  apps: [
    {
      name: 'quantum-chess-api',
      script: 'src/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Performance
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Restart policy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Environment variables
      env_file: '.env',
      
      // Monitoring
      pmx: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Error handling
      ignore_watch: ['node_modules', 'logs'],
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_errors: [5],
      
      // Advanced settings
      merge_logs: true,
      time: true,
      
      // Cluster settings
      instance_var: 'INSTANCE_ID',
      
      // Cron restart (optional - restart daily at 2 AM)
      cron_restart: '0 2 * * *'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-ec2-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/quantum-chess-app.git',
      path: '/var/www/quantum-chess',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 