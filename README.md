# 📓 Diary Dump

A modern React web application for journaling and emotional expression. Built with Next.js and Firebase, Diary Dump provides a clean, intuitive interface to capture your thoughts and memories.

## 🌐 Live Demo
[https://diary-dump.vercel.app](https://diary-dump.vercel.app)

## ✨ Features
- 📝 Create and manage diary entries
- 🔐 Secure authentication with Firebase
- 💾 Cloud-based storage
- 📱 Responsive design
- ⚡ Fast and optimized with Next.js

## 🛠️ Tech Stack
- **Frontend**: React 18, Next.js 14
- **Backend**: Firebase
- **Deployment**: Vercel
- **Language**: JavaScript

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/michaelkilong/Diary-Dump.git
   cd Diary-Dump
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Building & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## 📁 Project Structure
```
├── app/              # Next.js app directory
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions & helpers
├── public/          # Static assets
└── package.json     # Dependencies & scripts
```

## 🔑 Environment Variables
See `.env.example` for all required variables. You'll need:
- Firebase API Key
- Firebase Project ID
- Firebase Auth Domain
- And more (check `.env.example`)

## 📝 Usage
1. Sign up or log in with your account
2. Create a new diary entry
3. Write your thoughts and feelings
4. Save your entry
5. View and manage your past entries

## 🐛 Known Issues
None at the moment. Please report bugs in [Issues](https://github.com/michaelkilong/Diary-Dump/issues)

## 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is open source and available under the MIT License.

## 👤 Author
[Michael Kilong](https://github.com/michaelkilong)

## 💬 Support
For questions or issues, please open an [Issue](https://github.com/michaelkilong/Diary-Dump/issues) on GitHub.

---
**Made with ❤️ by Michael Kilong**
