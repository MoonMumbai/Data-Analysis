function AnalysisResults({ data }) {
  const { summary, target_detected } = data

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Analysis Results
      </h2>

      {/* Dataset Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Dataset Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Rows</p>
            <p className="text-2xl font-bold text-blue-600">{summary.shape[0]}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Columns</p>
            <p className="text-2xl font-bold text-green-600">{summary.shape[1]}</p>
          </div>
        </div>
      </div>

      {/* Target Detection */}
      {target_detected && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Target Column Detected</p>
          <p className="text-lg font-semibold text-yellow-800">{target_detected}</p>
          <p className="text-xs text-gray-500 mt-1">
            Supervised learning model will be trained
          </p>
        </div>
      )}

      {!target_detected && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            No target column detected. Unsupervised learning (anomaly detection) will be used.
          </p>
        </div>
      )}

      {/* Missing Values */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Missing Values</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
          {Object.keys(summary.missing).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(summary.missing)
                .filter(([_, count]) => count > 0)
                .map(([column, count]) => (
                  <div key={column} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{column}</span>
                    <span className="text-sm font-semibold text-red-600">{count}</span>
                  </div>
                ))}
              {Object.values(summary.missing).every(count => count === 0) && (
                <p className="text-sm text-gray-500">No missing values found</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No missing values</p>
          )}
        </div>
      </div>

      {/* Duplicates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Data Quality</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Duplicate Rows</span>
            <span className="text-sm font-semibold text-orange-600">
              {summary.duplicates}
            </span>
          </div>
        </div>
      </div>

      {/* Outliers */}
      {Object.keys(summary.outliers).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Outliers (IQR Method)</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {Object.entries(summary.outliers)
                .filter(([_, count]) => count > 0)
                .map(([column, count]) => (
                  <div key={column} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{column}</span>
                    <span className="text-sm font-semibold text-purple-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {summary.head && summary.head.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Data Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  {Object.keys(summary.head[0]).map((key) => (
                    <th key={key} className="text-left py-2 px-3 font-semibold text-gray-700">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.head.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    {Object.values(row).map((value, valIdx) => (
                      <td key={valIdx} className="py-2 px-3 text-gray-600">
                        {String(value).substring(0, 50)}
                        {String(value).length > 50 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisResults




