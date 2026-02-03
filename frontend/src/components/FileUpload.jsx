import { useState, useRef } from 'react'

function FileUpload({ onFileUpload, loading, onDownloadExample }) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileUpload(file)
      } else {
        alert('Please upload a CSV file')
      }
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Upload CSV File
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={dragActive ? { borderColor: '#007BFF', backgroundColor: '#E7F3FF' } : {}}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
        
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div>
            <p className="text-gray-600 mb-2">
              Drag and drop your CSV file here, or
            </p>
            <button
              onClick={handleButtonClick}
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: loading ? '#6c757d' : '#007BFF' }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#0056b3' }}
              onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#007BFF' }}
            >
              {loading ? 'Processing...' : 'Browse Files'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            CSV files only
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onDownloadExample}
          className="text-sm underline"
          style={{ color: '#007BFF' }}
          onMouseEnter={(e) => e.target.style.color = '#0056b3'}
          onMouseLeave={(e) => e.target.style.color = '#007BFF'}
        >
          Download example dataset
        </button>
      </div>
    </div>
  )
}

export default FileUpload

