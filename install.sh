#!/bin/bash

# Al Safa Global Website Installation Script
echo "🚀 Setting up Al Safa Global Website..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version $(node -v) detected"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm version $(npm -v) detected"
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Root dependencies installed successfully"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi
    
    print_status "Installing client dependencies..."
    cd client && npm install
    
    if [ $? -eq 0 ]; then
        print_success "Client dependencies installed successfully"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
    
    cd ..
}

# Setup environment file
setup_env() {
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file from template..."
        cp env.example .env.local
        print_warning "Please edit .env.local with your configuration before starting the application"
    else
        print_warning ".env.local already exists. Please ensure it's properly configured"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p server/uploads
    mkdir -p client/public/images
    print_success "Directories created successfully"
}

# Display setup instructions
show_instructions() {
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env.local with your configuration:"
    echo "   - MongoDB connection string"
    echo "   - Email settings (Gmail SMTP)"
    echo "   - JWT secret"
    echo "   - Other environment variables"
    echo ""
    echo "2. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "3. Or start them separately:"
    echo "   npm run server  # Backend only"
    echo "   npm run client  # Frontend only"
    echo ""
    echo "🌐 The application will be available at:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo ""
    echo "📚 For more information, see README.md"
    echo ""
}

# Main installation process
main() {
    echo "=========================================="
    echo "  Al Safa Global Website Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_npm
    echo ""
    
    # Install dependencies
    print_status "Installing dependencies..."
    install_dependencies
    echo ""
    
    # Setup environment
    print_status "Setting up environment..."
    setup_env
    echo ""
    
    # Create directories
    print_status "Creating project structure..."
    create_directories
    echo ""
    
    # Show instructions
    show_instructions
}

# Run main function
main 