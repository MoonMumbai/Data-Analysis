import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DataTrendChart({ historicalData }) {
  // Process historical data for chart
  const processData = () => {
    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort by timestamp to ensure chronological order
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Extract labels (timestamps) and values
    const labels = sortedData.map(item => {
      const date = new Date(item.timestamp);
      // Format timestamp as MM/DD HH:MM
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    const values = sortedData.map(item => item.value);
    const dataType = sortedData[0]?.type || 'prediction';

    return {
      labels,
      datasets: [
        {
          label: dataType === 'anomaly_score' ? 'Anomaly Score' : 'Prediction Value',
          data: values,
          borderColor: '#007BFF',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#007BFF',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const chartData = processData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Prediction Trends (Last 10 Predictions)',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#007BFF',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#007BFF',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const dataType = historicalData[context.dataIndex]?.type || 'prediction';
            const label = dataType === 'anomaly_score' ? 'Anomaly Score' : 'Prediction';
            return `${label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestamp',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: chartData.datasets[0]?.label || 'Value',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
        },
      },
    },
  };

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: '#007BFF' }}>
          Prediction Trends
        </h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No historical data available. Make predictions to see trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default DataTrendChart;




