# Al Safa Global - Procurement & Supply Chain Solutions

A modern, responsive website for Al Safa Global General Trading FZ LLC, showcasing comprehensive procurement and supply chain solutions across multiple industries.

## 🌟 Features

- **Modern React Frontend** with Framer Motion animations
- **Responsive Design** optimized for all devices
- **Contact Form** with email integration
- **Multiple Industry Divisions** (Construction, Oil & Gas, Industrial, Aviation, etc.)
- **Brand Partner Showcase** featuring trusted international brands
- **SEO Optimized** with React Helmet
- **Performance Optimized** with lazy loading and image optimization

## 🚀 Live Demo

Visit the live website: [https://al-safa-global.vercel.app](https://al-safa-global.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **React Icons** - Icon library
- **Styled Components** - CSS-in-JS styling
- **React Helmet** - SEO management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Nodemailer** - Email functionality
- **Multer** - File upload handling

### Deployment
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS files
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── .github/              # GitHub Actions
└── vercel.json           # Vercel configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayush346/AI-Safa-Global.git
   cd AI-Safa-Global
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000)

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run client` - Start only frontend
- `npm run server` - Start only backend

## 🌐 Deployment

### Vercel Deployment

The project is configured for automatic deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the React app in the `client/` directory
3. Deployments happen automatically on every push to main branch

### Environment Variables

Set these environment variables in Vercel:

- `NODE_ENV=production`
- `MONGODB_URI` (if using database)
- `EMAIL_SERVICE` (for contact form)

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎨 Design Features

- **Modern UI/UX** with smooth animations
- **Accessibility** compliant
- **Performance optimized** images and assets
- **SEO friendly** with proper meta tags
- **Cross-browser compatible**

## 📞 Contact Information

**Al Safa Global General Trading FZ LLC**
- **Email**: info@alsafaglobal.com
- **Phone**: 00971 4 3741 969
- **Address**: Compass Building, Al Shohada Road, Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vercel for seamless deployment
- All the open-source contributors whose libraries made this possible

---

**Built with ❤️ for Al Safa Global** 