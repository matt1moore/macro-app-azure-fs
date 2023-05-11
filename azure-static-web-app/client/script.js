// Wait for the document to finish loading
document.addEventListener("DOMContentLoaded", function() {

  // JavaScript code for the Economic Indicators Timeline

  // Sample data for economic indicators (replace with your own data)
  const indicatorData = [
    { date: "1940-01-01", inflation: 1.5, unemployment: 9.8, interest: 1.2 },
    { date: "1950-01-01", inflation: 1.8, unemployment: 5.3, interest: 1.6 },
    { date: "1960-01-01", inflation: 2.5, unemployment: 5.5, interest: 2.1 },
    // Add more data entries for each decade
    { date: "2023-01-01", inflation: 2.1, unemployment: 4.3, interest: 1.8 }
  ];

  // Calculate the width of each timeline step based on the data length
  const timelineStartYear = 1940;
  const timelineEndYear = 2023;
  const timelineWidth = 600; // Adjust as needed
  const timelineStep = timelineWidth / (timelineEndYear - timelineStartYear);

  // Get the timeline handle element
  const timelineHandle = document.getElementById("timeline-handle");
  const timeline = document.querySelector(".timeline");

  // Event listener for dragging the timeline handle
  timelineHandle.addEventListener("mousedown", startDrag);
  timelineHandle.addEventListener("touchstart", startDrag);

  // Function to handle the start of dragging
  function startDrag(event) {
    event.preventDefault();
    document.addEventListener("mousemove", dragTimeline);
    document.addEventListener("touchmove", dragTimeline);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
  }

  // Function to handle dragging the timeline
  function dragTimeline(event) {
    event.preventDefault();
    const mouseX = event.clientX || event.touches[0].clientX;
    const timelineRect = timeline.getBoundingClientRect();
    const timelineX = mouseX - timelineRect.left;

    // Constrain the handle within the timeline bounds
    const minTimelineX = 0;
    const maxTimelineX = timelineWidth;
    const constrainedTimelineX = Math.max(minTimelineX, Math.min(maxTimelineX, timelineX));

    // Snap the handle position to the closest timeline step
    const closestStep = Math.round(constrainedTimelineX / timelineStep);
    const newTimelineX = closestStep * timelineStep;

    // Update the handle position
    timelineHandle.style.transform = `translateX(${newTimelineX}px)`;

    // Calculate the selected year based on the closest step
    const selectedYear = timelineStartYear + closestStep;

    // Find the indicator data for the selected year
    const selectedData = indicatorData.find(data => {
      const dataYear = new Date(data.date).getFullYear();
      return dataYear === selectedYear;
    });

    // Update the indicator values based on the selected year
    document.getElementById("inflation-value").textContent = `Inflation: ${selectedData.inflation}%`;
    document.getElementById("unemployment-value").textContent = `Unemployment: ${selectedData.unemployment}%`;
    document.getElementById("interest-value").textContent = `Interest: ${selectedData.interest}%`;

    // Update the month and year display on the timeline
    const selectedMonth = new Date(selectedData.date).toLocaleString("default", { month: "short" });
    const yearLabel = document.getElementById("selected-year");
    yearLabel.textContent = `${selectedMonth} ${selectedYear}`;
    const handleRect = timelineHandle.getBoundingClientRect();
    const handleX = handleRect.left + handleRect.width / 2;
    yearLabel.style.left = `${handleX - yearLabel.offsetWidth / 2}px`;
  }

  // Function to handle the end of dragging
  function stopDrag(event) {
    event.preventDefault();
    document.removeEventListener("mousemove", dragTimeline);
    document.removeEventListener("touchmove", dragTimeline);
  }

});

/*
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


*/