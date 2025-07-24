#!/bin/bash

# Quantum Chess Backend Deployment Script
# This script sets up the backend on an EC2 instance

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
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
print_status "Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

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

# Set up firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 5000/tcp
    sudo ufw --force enable
fi

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
echo ""
echo "🌐 Application URLs:"
echo "  Health Check: http://$(curl -s ifconfig.me):5000/health"
echo "  API Base: http://$(curl -s ifconfig.me):5000/api"
echo ""
echo "📁 Application Directory: /var/www/quantum-chess"
echo "📝 Logs Directory: /var/www/quantum-chess/logs"
echo ""
print_warning "Don't forget to:"
echo "  1. Edit .env file with your configuration"
echo "  2. Set up SSL certificate (recommended)"
echo "  3. Configure domain name (optional)"
echo "  4. Set up monitoring and alerts"
echo "" 