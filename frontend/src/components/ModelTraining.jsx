import { useState } from 'react'
import { trainModel } from '../services/api'

function ModelTraining({ savedPath, targetDetected, onModelTrained }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)

  const handleTrain = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await trainModel(savedPath)
      setModelInfo(result)
      onModelTrained(result)
    } catch (err) {
      setError(err.message || 'Failed to train model')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Train Model
      </h2>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Model Type:</strong>{' '}
            {targetDetected ? (
              <span className="text-green-600">Supervised Learning</span>
            ) : (
              <span className="text-purple-600">Unsupervised Learning (Anomaly Detection)</span>
            )}
          </p>
          {targetDetected && (
            <p className="text-sm text-gray-600">
              <strong>Target:</strong> {targetDetected}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {modelInfo ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">
              ✓ Model Trained Successfully
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Model ID:</strong> {modelInfo.model_id}</p>
              <p><strong>Type:</strong> {modelInfo.type}</p>
              {modelInfo.target && (
                <p><strong>Target Column:</strong> {modelInfo.target}</p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={handleTrain}
            disabled={loading}
            className="w-full px-4 py-3 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            style={{ backgroundColor: loading ? '#6c757d' : '#007BFF' }}
            onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#0056b3' }}
            onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#007BFF' }}
          >
            {loading ? 'Training Model...' : 'Train Model'}
          </button>
        )}

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#007BFF' }}></div>
            <p className="text-sm text-gray-600 mt-2">This may take a few moments...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelTraining

