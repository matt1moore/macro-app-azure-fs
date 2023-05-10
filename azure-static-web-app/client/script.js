// Define the FRED series IDs for each economic indicator
const seriesIds = {
    gdp: 'GDP',
    unemployment: 'UNRATE',
    cpi: 'CPI',
    housingStarts: 'HOUST',
    stockMarketIndices: 'SP500',
    interestRates: 'FEDFUNDS',
    tradeBalance: 'NETEXP',
    consumerSentiment: 'UMCSENT',
  };
  
  // Function to fetch data from the server
  function fetchData(seriesId) {
    return fetch(`/api/data/${seriesId}`)
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => console.error('Error fetching data:', error));
  }
  
  // Function to update the chart with the fetched data
  function updateChart(chartId, seriesData) {
    // Create or update the chart using the chartId and seriesData
    // Replace this with your own charting library or implementation
    
    console.log('Chart updated:', chartId, seriesData);
  }
  
  // Function to fetch and update data for all indicators
  function updateDashboard() {
    Object.keys(seriesIds).forEach((indicator) => {
      const seriesId = seriesIds[indicator];
      
      // Fetch data for the indicator
      fetchData(seriesId)
        .then((data) => {
          // Update the chart with the fetched data
          updateChart(indicator, data);
        });
    });
  }
  
  // Call the updateDashboard function when the page is loaded
  window.addEventListener('DOMContentLoaded', updateDashboard);