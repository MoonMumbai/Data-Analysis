import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import AnalysisResults from './AnalysisResults'
import ModelTraining from './ModelTraining'
import PredictionPanel from './PredictionPanel'
import DataTrendChart from './DataTrendChart'
import { analyzeFile, downloadExample, getPredictionHistory } from '../services/api'

function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null)
  const [savedPath, setSavedPath] = useState(null)
  const [trainedModel, setTrainedModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [predictionHistory, setPredictionHistory] = useState([])

  const handleFileUpload = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeFile(file)
      setAnalysisData(result)
      setSavedPath(result.saved_path)
      setTrainedModel(null) // Reset model when new file is uploaded
    } catch (err) {
      setError(err.message || 'Failed to analyze file')
    } finally {
      setLoading(false)
    }
  }

  const handleModelTrained = async (modelInfo) => {
    setTrainedModel(modelInfo)
    // Load historical data when model is trained
    try {
      const historyData = await getPredictionHistory(modelInfo.model_id)
      setPredictionHistory(historyData.history || [])
    } catch (err) {
      console.error('Failed to load prediction history:', err)
      setPredictionHistory([])
    }
  }

  const handleHistoryUpdate = (history) => {
    setPredictionHistory(history)
  }

  const handleDownloadExample = async () => {
    try {
      const blob = await downloadExample()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'example_dataset.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message || 'Failed to download example')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#007BFF' }}>
          DataQC + ML Platform
        </h1>
        <p className="text-gray-600">
          Upload your CSV files for data quality analysis and machine learning model training
        </p>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            loading={loading}
            onDownloadExample={handleDownloadExample}
          />
          
          {analysisData && (
            <AnalysisResults data={analysisData} />
          )}

          {/* Trend Chart */}
          {trainedModel && predictionHistory.length > 0 && (
            <DataTrendChart historicalData={predictionHistory} />
          )}
        </div>

        {/* Right Column - Training and Prediction */}
        <div className="space-y-6">
          {savedPath && (
            <ModelTraining 
              savedPath={savedPath}
              targetDetected={analysisData?.target_detected}
              onModelTrained={handleModelTrained}
            />
          )}

          {trainedModel && (
            <PredictionPanel 
              model={trainedModel} 
              onHistoryUpdate={handleHistoryUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

