import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getHistory } from '../services/api'

const History = () => {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')
  const [transcriptions, setTranscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await getHistory()
      setTranscriptions(response.data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleDownload = (transcript, id) => {
    const element = document.createElement('a')
    const file = new Blob([transcript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `transcript-${id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <Link
              to="/dashboard"
              className="text-purple-600 hover:text-purple-800 font-medium text-sm transition"
            >
              🎙️ New Transcription
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
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Transcription History</h1>
          <p className="text-gray-500 mt-2">All your previous transcriptions in one place</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-500">Loading your transcriptions...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && transcriptions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No transcriptions yet!</h2>
            <p className="text-gray-500 mb-6">Upload an audio file or record your voice to get started</p>
            <Link
              to="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Start Transcribing
            </Link>
          </div>
        )}

        {/* TRANSCRIPTION LIST */}
        {!loading && transcriptions.length > 0 && (
          <div className="space-y-4">
            {transcriptions.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎵</span>
                      <span className="font-semibold text-gray-800">
                        {item.audioFilename || 'Recording'}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 ml-7">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(selected === item.id ? null : item.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium transition cursor-pointer"
                    >
                      {selected === item.id ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => handleDownload(item.transcript, item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>

                {/* TRANSCRIPT PREVIEW */}
                <p className="text-gray-600 text-sm line-clamp-2 ml-7">
                  {item.transcript}
                </p>

                {/* FULL TRANSCRIPT */}
                {selected === item.id && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 ml-7">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {item.transcript}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History