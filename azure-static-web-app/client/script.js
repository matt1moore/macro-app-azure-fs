// Wait for the document to finish loading
document.addEventListener('DOMContentLoaded', function () {
  // Retrieve the dashboard elements
  var infCurrentElement = document.getElementById('inf-current');
  var infAverageElement = document.getElementById('inf-average');
  var unemploymentCurrentElement = document.getElementById('unemployment-current');
  var unemploymentAverageElement = document.getElementById('unemployment-average');
  var interestCurrentElement = document.getElementById('interest-current');
  var interestAverageElement = document.getElementById('interest-average');
  // Add more elements for other indicators
  
  // Retrieve the chart elements
  var infChartElement = document.getElementById('inf-chart');
  var unemploymentChartElement = document.getElementById('unemployment-chart');
  var interestChartElement = document.getElementById('interest-chart');
  // Add more elements for other charts

  // Fetch data from the server and populate the dashboard
  fetchAvgData('CPIAUCSL', infAverageElement);
  fetchAvgData('UNRATE', unemploymentAverageElement);
  fetchAvgData('DFF', interestAverageElement);

  fetchCurrData('CPIAUCSL', infCurrentElement);
  fetchCurrData('UNRATE', unemploymentCurrentElement);
  fetchCurrData('DFF', interestCurrentElement);
  // Call fetchData for other indicators
  
  // Create interactive line charts
  createLineChart('CPIAUCSL', infChartElement);
  createLineChart('UNRATE', unemploymentChartElement);
  createLineChart('DFF', interestChartElement);
  // Call createLineChart for other indicators
  
  // Add more functions for other chart types and interactive elements
  
  function fetchAvgData(indicator, averageElement) {
    // Construct the API endpoint URL
    const apiUrl = 'http://localhost:8080/average-data?indicator=' + indicator;
  
    // Make a fetch request to the API endpoint
    fetch(apiUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        // Use the retrieved data to populate the dashboard elements
        averageElement.textContent = 'Average: ' + data[0].AverageFSD;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  function fetchCurrData(indicator, currentElement) {
    // Construct the API endpoint URL
    const apiUrl = 'http://localhost:8080/current-data?indicator=' + indicator;
  
    // Make a fetch request to the API endpoint
    fetch(apiUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        // Use the retrieved data to populate the dashboard elements
        currentElement.textContent = 'Current: ' + data[0].Value;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  
  function createLineChart(indicator, chartElement) {
    // Construct the API endpoint URL
    const apiUrl = 'http://localhost:8080/chart-data?indicator=' + indicator;
  
    // Make a fetch request to the API endpoint
    fetch(apiUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        // Extract the necessary data for the chart
        const labels = data.map(entry => entry.Date);
        const values = data.map(entry => entry.Value);
  
        // Create a line chart using a charting library (e.g., Chart.js, D3.js)
        const chart = new Chart(chartElement, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: indicator,
                data: values,
                borderColor: 'blue',
                backgroundColor: 'transparent',
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Date'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Value'
                }
              }
            }
          }
        });
      })
      .catch(error => {
        console.error('Error fetching chart data:', error);
      });
  }
  
  
  // Add more functions for other chart types and interactive elements
});
