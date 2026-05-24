import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { transcribeAudio } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  const [activeTab, setActiveTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  // FILE UPLOAD HANDLER
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setTranscript('')
    setError('')
  }

  const handleFileTranscribe = async () => {
    if (!file) return setError('Please select an audio file first!')
    setLoading(true)
    setError('')
    setTranscript('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await transcribeAudio(formData)
      setTranscript(response.data.transcript)
    } catch (err) {
      setError('Transcription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // MIC RECORDING HANDLERS
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      setTranscript('')
      setError('')
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
    setError('')
    setTranscript('')
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      const response = await transcribeAudio(formData)
      setTranscript(response.data.transcript)
    } catch (err) {
      setError('Transcription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // DOWNLOAD TRANSCRIPT
  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([transcript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'transcript.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-violet-52 via-purple-52 to-indigo-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <span className="text-xl font-bold text-purple-700">SpeechToText</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">👋 Hello, {name}!</span>
            <Link
              to="/history"
              className="text-purple-600 hover:text-purple-800 font-medium text-sm transition"
            >
              📋 History
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* PAGE TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Speech to Text</h1>
          <p className="text-gray-500 mt-2">Upload an audio file or record your voice to get instant transcription</p>
        </div>

        {/* TABS */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-1">
          <button
            onClick={() => { setActiveTab('upload'); setTranscript(''); setError('') }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            📁 Upload Audio File
          </button>
          <button
            onClick={() => { setActiveTab('record'); setTranscript(''); setError('') }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'record'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-500 hover:text-purple-600'
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
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg font-medium cursor-pointer hover:bg-purple-200 transition"
              >
                Choose File
              </label>
              {file && (
                <p className="mt-3 text-green-600 font-medium text-sm">
                  ✅ {file.name} selected
                </p>
              )}
            </div>

            <button
              onClick={handleFileTranscribe}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? '⏳ Transcribing... (this may take 30 seconds)' : '✨ Transcribe Audio'}
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
                <button
                  onClick={startRecording}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                >
                  🔴 Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                >
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
              {loading ? '⏳ Transcribing... (this may take 30 seconds)' : '✨ Transcribe Recording'}
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* TRANSCRIPT RESULT */}
        {transcript && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">📝 Transcript</h2>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
              >
                ⬇️ Download
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed">
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard