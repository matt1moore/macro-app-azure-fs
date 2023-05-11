# Macro-Economic Data Science Web App

This project is a web application which displays FRED economic data to users in an interesting and unique way. The intention of this project is to describe to macro-economy that we live in and analyze how key economic indicators including the Consumer Price Index, Federal Funds Rate, GDP, GDP per Capita, Dow Jones points, S&P500 points, Treasury Rate, Interest Rate, and Unemployment Rate all combine to makeup the health of our macro-economy. 

# Major Components
1. Azure Function App
    1. GetHistoricalData - Complete
        1. Description: Grabs every single row for a specific FRED seriesId
    1. GetUnrateData - Complete
        1. Description: Grabe the most recent data point from the unemployment rate json object provided by FRED
    1. GetSp500Data - Complete
        1. Description: Grabe the most recent data point from the SP500 json object provided by FRED
    1. GetInfData - Complete
        1. Description: Grabe the most recent data point from the inflation rate json object provided by FRED
1. Azure Database
    1. Schema - Complete
        1. Stored within the dacpac file, required for all deployments
    1. Firewall - Compelte
        1. Rules set for local db query editing and management
        1. Rules set for Azure resources within the same resource group to access with ease
    1. Historical Data Batch Jobs - Incomplete
        1. Completed for some economic indicators but not all, requires manual triggering of the GetHistoricalData function
1. Azure Web Application
    1. Front-End - Complete
        1. NodeJS data implementation
        1. GraphJS visualization implementation
    1. API - Incomplete
        1. 

