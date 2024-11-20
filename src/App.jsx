import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import './index.css';

function App() {
  const [location, setLocation] = useState('Jogja');
  const [selectedPollutant, setSelectedPollutant] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);      

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handlePollutantChange = (event) => {
    setSelectedPollutant(event.target.value);
  };

  const handleGenerateClick = async () => {
    const response = await fetch(
      `/api/prediction?location=${location}&pollutant=${selectedPollutant}`
    );
    const data = await response.json();
  
    const predictionData = {
      labels: data.predictions.cnn.map((point, index) => `Time ${index}`),
      datasets: Object.keys(data.predictions).map((model) => ({
        label: `${model} Prediction`,
        data: data.predictions[model].map((point) => point.value),
        borderColor: getColorForModel(model),
        fill: false,
      })),
    };
  
    setChartData(predictionData);
  };
  
  const getColorForModel = (model) => {
    switch (model) {
      case 'cnn': return 'rgb(75, 192, 192)';
      case 'rnn': return 'rgb(255, 99, 132)';
      case 'lstm': return 'rgb(153, 102, 255)';
      case 'sarima': return 'rgb(54, 162, 235)';
      case 'gru': return 'rgb(255, 159, 64)';
      default: return 'rgb(0, 0, 0)';
    }
  };  

  return (
    <div className="container">
      <h1>Air Quality Predictor</h1>

      <div>
        <label>
          Location:
          <span style={{ marginRight: '8px' }}></span>
          <select value={location} onChange={handleLocationChange}>
            <option value="Jogja">Jogja</option>
            <option value="Tangsel">Tangsel</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Pollutant:
          <span style={{ marginRight: '8px' }}></span>
          <select value={selectedPollutant} onChange={handlePollutantChange}>
            <option value="">Select Pollutant</option>
            <option value="PM2.5">PM2.5</option>
            <option value="PM10">PM10</option>
            <option value="SO2">SO2</option>
            <option value="CO">CO</option>
            <option value="O3">O3</option>
            <option value="NO2">NO2</option>
          </select>
        </label>
      </div>

      <button style={{ marginTop: '20px', padding: '10px 20px' }} onClick={handleGenerateClick} disabled={loading}>
        {loading ? 'Loading...' : 'Generate Prediction Graph'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <p>{error}</p>
        </div>
      )}

      {chartData && (
        <div style={{ width: '50%', marginTop: '20px' }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `(${tooltipItem.label}, ${tooltipItem.raw})`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
