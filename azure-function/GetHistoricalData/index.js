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
    // const historicData = await fetchData('UNRATE');
    // const historicData = await fetchData('CPIAUCSL');
    // const historicData = await fetchData('A939RX0Q048SBEA');
    const historicData = await fetchData('DFF');
    // const historicData = await fetchData('HOUST');
    // const historicData = await fetchData('USSTHPI');
    // const historicData = await fetchData('GDPC1');
    // const historicData = await fetchData('DJIA');
    // const historicData = await fetchData('FEDFUNDS');
    // const historicData = await fetchData('DGS10');
    // const historicData = await fetchData('BOPGSTB');
    // const historicData = await fetchData('BOPGEX');
    // const historicData = await fetchData('BOPGSV');

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
  
async function insertData(context, connection, data) {
  const table = 'FredSeriesData'; // Replace with the name of your database table

  let insertQuery = `INSERT INTO ${table} (SeriesId, Date, Value) VALUES `;
  const values = [];

  var i = 0;
  for (const item of data) {
    if (i >= ITEM_LOWER_LIMIT && i < ITEM_UPPER_LIMIT) {
      // Conditional manages the Tedious and Azure limit on SQL parameters
      insertQuery += `(@seriesId_${values.length},
         @date_${values.length}, @value_${values.length}), `;
      values.push([item.seriesId, item.date, item.value]);
    }
    i += 1;
  }

  // Remove the trailing comma and space
  insertQuery = insertQuery.slice(0, -2);

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
