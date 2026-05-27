import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { transcribeAudio } from '../services/api'

const LANGUAGES = [
  { code: 'auto', label: '🌐 Auto Detect' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'kn', label: '🇮🇳 Kannada' },
  { code: 'te', label: '🇮🇳 Telugu' },
  { code: 'ml', label: '🇮🇳 Malayalam' },
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'mr', label: '🇮🇳 Marathi' },
  { code: 'gu', label: '🇮🇳 Gujarati' },
  { code: 'bn', label: '🇮🇳 Bengali' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'pt', label: '🇧🇷 Portuguese' },
  { code: 'nl', label: '🇳🇱 Dutch' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'ru', label: '🇷🇺 Russian' },
  { code: 'tr', label: '🇹🇷 Turkish' },
  { code: 'uk', label: '🇺🇦 Ukrainian' },
  { code: 'vi', label: '🇻🇳 Vietnamese' },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  const [activeTab, setActiveTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('auto')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const resetResults = () => {
    setTranscript('')
    setSummary('')
    setWordCount(0)
    setDetectedLanguage('')
    setError('')
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    resetResults()
  }

  const handleTranscribeResponse = (response) => {
    setTranscript(response.data.transcript)
    setSummary(response.data.summary || '')
    setWordCount(response.data.wordCount || 0)
    setDetectedLanguage(response.data.language || '')
  }

  const handleFileTranscribe = async () => {
    if (!file) return setError('Please select an audio file first!')
    setLoading(true)
    resetResults()
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await transcribeAudio(formData, language)
      handleTranscribeResponse(response)
    } catch (err) {
      setError('Transcription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorder.start()
      setRecording(true)
      resetResults()
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleRecordingTranscribe = async () => {
    if (!audioBlob) return setError('Please record audio first!')
    setLoading(true)
    resetResults()
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      const response = await transcribeAudio(formData, language)
      handleTranscribeResponse(response)
    } catch (err) {
      setError('Transcription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = summary
      ? `TRANSCRIPT\n\n${transcript}\n\n---\nSUMMARY\n\n${summary}`
      : transcript
    const element = document.createElement('a')
    const fileBlob = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(fileBlob)
    element.download = 'transcript.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguageLabel = (code) => {
    const lang = LANGUAGES.find(l => l.code === code)
    return lang ? lang.label : code
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <span className="text-xl font-bold text-purple-700">SpeechToText</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">👋 Hello, {name}!</span>
            <Link to="/history" className="text-purple-600 hover:text-purple-800 font-medium text-sm transition">
              📋 History
            </Link>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Speech to Text</h1>
          <p className="text-gray-500 mt-2">Upload audio or record your voice to get instant transcription</p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🌐 Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          {language === 'auto' && (
            <p className="text-xs text-gray-400 mt-1">
              Auto detect will identify the language automatically
            </p>
          )}
        </div>

        {/* TABS */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-1">
          <button
            onClick={() => { setActiveTab('upload'); resetResults() }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'upload' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            📁 Upload Audio File
          </button>
          <button
            onClick={() => { setActiveTab('record'); resetResults() }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'record' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            🎤 Record Voice
          </button>
        </div>

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center mb-6 hover:border-purple-500 transition">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500 mb-4">Select an audio file (.mp3, .wav, .m4a, .webm)</p>
              <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg font-medium cursor-pointer hover:bg-purple-200 transition">
                Choose File
              </label>
              {file && <p className="mt-3 text-green-600 font-medium text-sm">✅ {file.name} selected</p>}
            </div>
            <button
              onClick={handleFileTranscribe}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? '⏳ Transcribing... (30-60 seconds)' : '✨ Transcribe Audio'}
            </button>
          </div>
        )}

        {/* RECORD TAB */}
        {activeTab === 'record' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className={`text-7xl mb-4 ${recording ? 'animate-pulse' : ''}`}>
                {recording ? '🔴' : '🎤'}
              </div>
              <p className="text-gray-500">
                {recording ? 'Recording in progress... speak clearly!' : 'Click the button below to start recording'}
              </p>
            </div>
            <div className="flex gap-3 mb-6">
              {!recording ? (
                <button onClick={startRecording} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition cursor-pointer">
                  🔴 Start Recording
                </button>
              ) : (
                <button onClick={stopRecording} className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition cursor-pointer">
                  ⏹ Stop Recording
                </button>
              )}
            </div>
            {audioUrl && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2 font-medium">Preview your recording:</p>
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}
            <button
              onClick={handleRecordingTranscribe}
              disabled={loading || !audioBlob}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? '⏳ Transcribing... (30-60 seconds)' : '✨ Transcribe Recording'}
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {transcript && (
          <div className="mt-6 space-y-4">

            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{wordCount}</div>
                <div className="text-xs text-gray-500 mt-1">Words</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-indigo-600">{transcript.length}</div>
                <div className="text-xs text-gray-500 mt-1">Characters</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <div className="text-lg font-bold text-violet-600">{getLanguageLabel(detectedLanguage)}</div>
                <div className="text-xs text-gray-500 mt-1">Detected Language</div>
              </div>
            </div>

            {/* TRANSCRIPT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">📝 Transcript</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed">
                {transcript}
              </div>
            </div>

            {/* AI SUMMARY */}
            {summary && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">🤖 AI Summary</h2>
                <div className="bg-purple-50 rounded-xl p-4 text-gray-700 leading-relaxed text-sm">
                  {summary}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard