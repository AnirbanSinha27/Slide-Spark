# Slide Spark - AI PowerPoint Generator

> Transform your ideas into professional PowerPoint presentations using Google Gemini AI

An intelligent presentation generator powered by Google's Gemini AI.

## ✨ Features

- 🤖 **Google Gemini AI** - Intelligent content generation
- 💬 **Conversational Interface** - Natural language input
- 👀 **Real-time Preview** - Instant slide visualization
- 📜 **History Sidebar** - Access past presentations
- 🎨 **Beautiful UI** - Claude-inspired design
- ⚡ **Quick Export** - One-click PPTX download

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **PPT Generation**: PptxGenJS

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/slideforge.git
cd slideforge
npm install
```

### 2. Setup Environment Variables

Create `.env.local` in the root directory:

```env
# Google Gemini API Key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_api_key_here

# Optional Configuration
NEXT_PUBLIC_GEMINI_MODEL=gemini-pro
NEXT_PUBLIC_MAX_SLIDES=25
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste it into `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 💻 Usage

### Example Prompts

```
"Create a 5-slide presentation about renewable energy"

"Make a business pitch deck for a SaaS startup with 8 slides"

"Generate educational slides about the solar system for kids"

"Build a marketing strategy presentation with 10 slides"
```

### Workflow

1. Type your presentation requirements
2. AI generates slides with headings, descriptions, and bullets
3. Preview slides in the right panel
4. Download as PPTX file
5. Access history from the left sidebar

## ⚙️ Configuration


## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable:
   - `NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY`
4. Deploy

### Build Locally

```bash
npm run build
npm run start
```

## 🔒 Security

- Never commit `.env.local` to version control
- Keep API keys secure
- Implement rate limiting for production
- Sanitize user inputs before API calls

## 🐛 Troubleshooting

**API Key Error**
- Verify key in `.env.local` has no extra spaces
- Check key is active in Google AI Studio

**Slides Not Generating**
- Check internet connection
- Verify API quota hasn't been exceeded
- Simplify your prompt

**Preview Panel Not Showing**
- Click toggle button in top-right corner
- Check browser console for errors

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Google Gemini AI
- Claude.ai UI inspiration
- Tailwind CSS
- Lucide Icons

## 📧 Contact

- GitHub: [@AnirbanSinha27](https://github.com/AnirbanSinha27)
- Email: anirbansinha27@gmail.com

---

**Made with ❤️ using Next.js and Google Gemini AI**

⭐ Star this repo if you find it helpful!
