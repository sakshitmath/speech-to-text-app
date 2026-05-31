# 🎙️ Speech to Text App

A full-stack web application that converts speech to text using AI. Upload an audio file or record your voice directly in the browser — get an instant transcription with AI-generated summary, word count, and multi-language support.

🔗 **Live Demo:** [speech-to-text-app-orcin.vercel.app](https://speech-to-text-app-orcin.vercel.app)

---

## ✨ Features

- 🔐 User Registration & Login with JWT Authentication
- 🎤 Record voice directly from the browser microphone
- 📁 Upload audio files (.mp3, .wav, .m4a, .webm)
- 🌍 Multi-language support (24 languages + Auto Detect)
- 🤖 AI-powered transcription via AssemblyAI
- 📝 AI Summary generation for each transcription
- 🔢 Word count display
- 📋 Copy transcript to clipboard
- ⬇️ Download transcript as text file
- 🕓 Transcription history per user
- ☁️ Fully deployed (Vercel + Railway + PostgreSQL)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot 3.5 |
| Database | PostgreSQL |
| Speech AI | AssemblyAI API |
| Auth | JWT Tokens |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

---

## 📁 Project Structure

```
speech-to-text-app/
├── backend/
│   └── src/main/java/com/sttapp/backend/
│       ├── controller/       # REST API endpoints
│       ├── service/          # Business logic + AssemblyAI integration
│       ├── repository/       # Database access
│       ├── model/            # Entity classes
│       ├── dto/              # Data Transfer Objects
│       ├── config/           # Security + CORS config
│       └── security/         # JWT filter + utilities
├── frontend/
│   └── src/
│       ├── pages/            # Login, Register, Dashboard, History
│       ├── services/api.js   # All API calls (Axios)
│       └── components/       # Reusable UI components
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Speech
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/speech/transcribe?language=auto` | Upload audio and transcribe |
| GET | `/api/speech/history` | Get all transcriptions for user |
| GET | `/api/speech/{id}` | Get single transcription by ID |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check backend status |

---

## 🚀 Running Locally

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend

# Set environment variables or update application.properties
# SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sttdb
# SPRING_DATASOURCE_USERNAME=postgres
# SPRING_DATASOURCE_PASSWORD=your_password
# JWT_SECRET=yourSecretKey
# JWT_EXPIRATION=604800000
# ASSEMBLYAI_API_KEY=your_assemblyai_key

# Run with IntelliJ IDEA or:
./mvnw spring-boot:run
# Runs on http://localhost:8081
```

### Frontend
```bash
cd frontend
npm install

# Create .env file:
# VITE_API_URL=http://localhost:8081/api

npm run dev
# Runs on http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (Railway)
| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRATION` | Token expiry in ms (e.g. 604800000 = 7 days) |
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI API key |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 🌐 Deployment

- **Frontend** → Push to GitHub → Auto-deploys on Vercel
- **Backend** → Push to GitHub → Auto-deploys on Railway
- **Database** → PostgreSQL hosted on Railway

---

## 📸 Screenshots

> Dashboard — Upload or record audio and get instant transcription with AI summary.

> History — View all past transcriptions with word count and language info.

---

## 👩‍💻 Author

**Sakshi** — [github.com/sakshitmath](https://github.com/sakshitmath)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
