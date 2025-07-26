#!/bin/bash

# Quantum Chess Backend Deployment Script
# This script sets up the backend on an Amazon Linux EC2 instance

set -e

echo "🚀 Starting Quantum Chess Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo yum update -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
print_status "Installing MongoDB using Docker (recommended for Amazon Linux 2)..."

# Install Docker
print_status "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Create MongoDB data directory
sudo mkdir -p /var/lib/mongodb
sudo chown $USER:$USER /var/lib/mongodb

# Run MongoDB in Docker
print_status "Starting MongoDB in Docker container..."
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v /var/lib/mongodb:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=quantumchess123 \
  mongo:6.0

# Wait for MongoDB to start
print_status "Waiting for MongoDB to start..."
sleep 10

# Test MongoDB connection
if docker exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_status "✅ MongoDB is running successfully!"
else
    print_error "❌ MongoDB failed to start"
    print_status "Checking Docker logs..."
    docker logs mongodb
fi

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/quantum-chess
sudo chown $USER:$USER /var/www/quantum-chess

# Copy application files (assuming you're in the backend directory)
print_status "Copying application files..."
cp -r . /var/www/quantum-chess/

# Navigate to application directory
cd /var/www/quantum-chess

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Set up environment file
if [ ! -f .env ]; then
    print_status "Creating environment file..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration"
fi

# Set up PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/quantum-chess << EOF
/var/www/quantum-chess/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Create systemd service for PM2 (optional)
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/quantum-chess.service << EOF
[Unit]
Description=Quantum Chess API
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/var/www/quantum-chess
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload quantum-chess-api
ExecStop=/usr/bin/pm2 stop quantum-chess-api
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable quantum-chess.service
sudo systemctl start quantum-chess.service

# Set up firewall (Amazon Linux uses iptables, but we'll use security groups)
print_status "Configuring security groups..."
print_warning "Please ensure your EC2 security group allows ports 22, 80, 443, and 5000"

# Install and configure nginx (optional for reverse proxy)
print_status "Installing nginx..."
sudo yum install -y nginx

# Create nginx configuration
print_status "Creating nginx configuration..."
sudo tee /etc/nginx/conf.d/quantum-chess.conf << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start and enable nginx
print_status "Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Health check
print_status "Performing health check..."
sleep 5
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_status "✅ Application is running successfully!"
else
    print_error "❌ Application health check failed"
    print_status "Checking PM2 status..."
    pm2 status
    print_status "Checking logs..."
    pm2 logs quantum-chess-api --lines 10
fi

# Display final information
echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Useful commands:"
echo "  PM2 Status: pm2 status"
echo "  PM2 Logs: pm2 logs quantum-chess-api"
echo "  Restart: pm2 restart quantum-chess-api"
echo "  Stop: pm2 stop quantum-chess-api"
echo "  Nginx Status: sudo systemctl status nginx"
echo "  Nginx Logs: sudo tail -f /var/log/nginx/error.log"
echo "  MongoDB Status: docker ps | grep mongodb"
echo "  MongoDB Logs: docker logs mongodb"
echo "  MongoDB Shell: docker exec -it mongodb mongosh"
echo ""
echo "🌐 Application URLs:"
echo "  Health Check: http://$(curl -s ifconfig.me):5000/health"
echo "  API Base: http://$(curl -s ifconfig.me):5000/api"
echo "  Nginx Proxy: http://$(curl -s ifconfig.me)"
echo ""
echo "📁 Application Directory: /var/www/quantum-chess"
echo "📝 Logs Directory: /var/www/quantum-chess/logs"
echo "🗄️ MongoDB Data: /var/lib/mongodb"
echo ""
print_warning "Don't forget to:"
echo "  1. Edit .env file with your configuration"
echo "  2. Configure EC2 security groups for ports 22, 80, 443, 5000"
echo "  3. Set up SSL certificate with Let's Encrypt (recommended)"
echo "  4. Configure domain name (optional)"
echo "  5. Set up CloudWatch monitoring and alerts"
echo "  6. Change MongoDB password in production"
echo "" 