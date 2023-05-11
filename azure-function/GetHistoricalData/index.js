/*******************************************************************
 * Name: Matthew Moore
 * Date: 5/10/2023
 * Subject: Data Science Lab
 * Project: Economic Dashboard
 * File: GetHistoricData - API Call
 * Description: This file is deployed as a function app that can grab
 * all sorts of series data based on their ID's. This function is intended
 * for manual use when a database needs to be initially set up. After
 * that point there is no need for this function.
 *******************************************************************/

const axios = require('axios');
const { Connection, Request, TYPES } = require('tedious');
require('dotenv').config();

// Add the first 600 elements
const ITEM_LOWER_LIMIT = 0; 
const ITEM_UPPER_LIMIT = 600;
// Add the next 600 elements
// ITEM_LOWER_LIMIT = 601;
// ITEM_UPPER_LIMIT = 1200;
// Add the next 600 elements
// ITEM_LOWER_LIMIT = 1201;
// ITEM_UPPER_LIMIT = 1800;

module.exports = async function (context, req) {
  try {
    // Fetch data from FRED API
    // This fetches 
    // const historicalData = await fetchData('CPIAUCSL');
    // This fetches all historical unemployment rate data
    // const historicData = await fetchData('UNRATE');
    // This fetches all historical interest rate data
    // const historicData = await fetchData('DFF');
    // This fetches all GDP per capita for the US data
    // const historicData = await fetchData('A939RX0Q048SBEA');
    // This fetches all historical SP500 points data
    const historicData = await fetchData('SP500');
    // This fetches all historical Housing price index data
    // const historicData = await fetchData('USSTHPI');
    // This fetches all historical GDP data
    // const historicData = await fetchData('GDPC1');
    // This fetches all historical Dow Jones points data
    // const historicData = await fetchData('DJIA');
    // This fetches all historical Federanl Funds Rate data
    // const historicData = await fetchData('FEDFUNDS');
    // This fetches all historical Treasury Rate data
    // const historicData = await fetchData('DGS10');

    // Store data in Azure Database
    await storeDataInAzureDB(context, historicData);

    context.res = {
      status: 200,
      body: 'Data stored successfully',
    };
    console.log('Data has stored successfully')
  } catch (error) {
    context.res = {
      status: 500,
      body: 'An error occurred while storing data',
    };
    context.log.error(error);
    console.error('An error has occurred while storing data')
  }
};

async function fetchData(seriesId) {
  const apiKey = process.env.FRED_API_KEY;
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  const response = await axios.get(url);
  const observations = response.data.observations;

  // Extract the date and value from each observation
  const observationData = observations.map((observation) => {
    const { date, value } = observation;
    return { seriesId, date, value };
  });

  return observationData;
}

async function storeDataInAzureDB(context, data) {
  const azureConfig = {
    server: 'final-economic-server.database.windows.net',
    database: 'main_fred_db',
    authentication: {
      type: 'default',
      options: {
        userName: process.env.AZURE_DB_USERNAME,
        password: process.env.AZURE_DB_PASS,
      },
    },
    options: {
      database: 'main_fred_db',
      encrypt: true,
    },
  };

  const connection = new Connection(azureConfig);

  connection.on('connect', (err) => {
    if (err) {
      context.log.error(err);
      console.log(err);
      throw new Error('Connection is not in the LoggedIn state');
    } else {
      console.log('Connection to database occurred successfully')
      insertData(context, connection, data);
    }
  });

  connection.connect();
}

function validateType(value, type) {
  switch (type) {
    case "NVarChar":
      return typeof value === "string";
    case "Date":
      return value instanceof Date && !isNaN(value);
    case "Float":
      return typeof value === "number" && !isNaN(value);
    // Add more cases for other parameter types if needed
    default:
      return true; // Assume the type is valid if not explicitly checked
  }
}
  
async function insertData(context, connection, data) {
  const table = 'FredSeriesData'; // Replace with the name of your database table

  let insertQuery = `INSERT INTO ${table} (SeriesId, Date, Value) VALUES `;
  const values = [];

  var i = 0;
  for (const item of data) {
    if (i >= ITEM_LOWER_LIMIT && i < ITEM_UPPER_LIMIT) {
      // Conditional manages the Tedious and Azure limit on SQL parameters, which is 600
      const seriesId = item.seriesId;
      const date = new Date(item.date);
      const value = item.value;
      // Perform parameter type validation
      const isValidSeriesId = validateType(seriesId, "NVarChar");
      const isValidDate = validateType(date, "Date");
      const isValidValue = validateType(value, "Float");
      // Skip the row if any of the parameter types fail validation
      if (!isValidSeriesId || !isValidDate || !isValidValue) {
        continue;
      }
      insertQuery += `(@seriesId_${values.length},
         @date_${values.length}, @value_${values.length}), `;
      values.push([seriesId, date, value]);
    }
    i += 1;
  }

  // Remove the trailing comma and space
  insertQuery = insertQuery.slice(0, -2);
  console.log(insertQuery)
  const request = new Request(insertQuery, (err) => {
    if (err) {
      console.log(err);
      context.log.error(err);
      throw err;
    } else {
      context.log('Request made successfully');
      console.log('Request made successfully');
      connection.close();
    }
  });

  for (let i = 0; i < values.length; i++) {
    const paramName = `seriesId_${i}`;
    const paramType = TYPES.NVarChar;
    request.addParameter(paramName, paramType, values[i][0]);
  }
  console.log("Here is the first element in values: " + values[0])

  for (let i = 0; i < values.length; i++) {
    const paramName = `date_${i}`;
    const paramType = TYPES.Date;
    request.addParameter(paramName, paramType, new Date(values[i][1]));
  }

  for (let i = 0; i < values.length; i++) {
    const paramName = `value_${i}`;
    const paramType = TYPES.Float;
    request.addParameter(paramName, paramType, values[i][2]);
  }

  try {
    console.log('Request made of:' + request.parameters[0])
    connection.execSql(request);
  } catch {
    // Handle the case when the connection is not in the LoggedIn state
    throw new Error('Connection is not in the LoggedIn state');
  }
}
