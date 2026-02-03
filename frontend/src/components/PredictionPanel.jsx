import { useState, useRef } from 'react'
import { predict } from '../services/api'

function PredictionPanel({ model, onHistoryUpdate }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
      setError(null)
    }
  }

  const handlePredict = async () => {
    if (!file) {
      setError('Please select a CSV file for predictions')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await predict(model.model_id, file)
      setResults(result)
      // Notify parent component about updated history
      if (result.history && onHistoryUpdate) {
        onHistoryUpdate(result.history)
      }
    } catch (err) {
      setError(err.message || 'Failed to make predictions')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const downloadResults = () => {
    if (!results) return

    let csvContent = ''
    if (results.predictions) {
      csvContent = 'Prediction\n'
      results.predictions.forEach(pred => {
        csvContent += `${pred}\n`
      })
    } else if (results.anomaly_score) {
      csvContent = 'Anomaly_Score\n'
      results.anomaly_score.forEach(score => {
        csvContent += `${score}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictions_${model.model_id}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Make Predictions
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Model ID:</strong> {model.model_id}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Type:</strong> {model.type}
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
          
          <button
            onClick={handleButtonClick}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {file ? file.name : 'Select CSV File'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || !file}
          className="w-full px-4 py-3 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          style={{ backgroundColor: (loading || !file) ? '#6c757d' : '#28A745' }}
          onMouseEnter={(e) => { if (!loading && file) e.target.style.backgroundColor = '#218838' }}
          onMouseLeave={(e) => { if (!loading && file) e.target.style.backgroundColor = '#28A745' }}
        >
          {loading ? 'Processing...' : 'Predict'}
        </button>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#28A745' }}></div>
          </div>
        )}

        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-green-800">
                Predictions Ready
              </h3>
              <button
                onClick={downloadResults}
                className="px-3 py-1 text-white text-sm rounded transition-colors"
                style={{ backgroundColor: '#28A745' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28A745'}
              >
                Download CSV
              </button>
            </div>
            
            <div className="bg-white rounded p-3 max-h-64 overflow-y-auto">
              {results.predictions ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Predictions ({results.predictions.length} rows):
                  </p>
                  <div className="space-y-1">
                    {results.predictions.slice(0, 10).map((pred, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        Row {idx + 1}: {String(pred)}
                      </p>
                    ))}
                    {results.predictions.length > 10 && (
                      <p className="text-xs text-gray-500 italic">
                        ... and {results.predictions.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              ) : results.anomaly_score ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Anomaly Scores ({results.anomaly_score.length} rows):
                  </p>
                  <div className="space-y-1">
                    {results.anomaly_score.slice(0, 10).map((score, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        Row {idx + 1}: {score.toFixed(4)}
                      </p>
                    ))}
                    {results.anomaly_score.length > 10 && (
                      <p className="text-xs text-gray-500 italic">
                        ... and {results.anomaly_score.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionPanel

