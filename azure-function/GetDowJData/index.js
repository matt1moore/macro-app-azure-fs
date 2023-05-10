/*******************************************************************
 * Name: Matthew Moore
 * Date: 5/10/2023
 * Subject: Data Science Lab
 * Project: Economic Dashboard
 * File: GetDowJData - API Call
 * Description: This file is deployed as a function app that grabs the
 * most recent instance of a Dow Jones point reading from FRED.
 * Make sure the database has integrity to prevent duplicates. Prior 
 * to triggering this function daily.
 *******************************************************************/
const axios = require('axios');
const { Connection, Request, TYPES } = require('tedious');
require('dotenv').config();

module.exports = async function (context, req) {
  try {
    // Fetch data from FRED API
    const dowJonesData = await fetchData('DJIA');
    // Store data in Azure Database
    await storeDataInAzureDB(context, dowJonesData);

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
  const apiKey = process.env.FRED_API_KEY
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  const response = await axios.get(url);
  const observations = response.data.observations;

  // Extract the latest value from the observations
  const latestObservation = observations[observations.length - 1];
  const { date, value } = latestObservation;

  return { seriesId, date, value };
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

  const insertQuery = `
    INSERT INTO ${table} (SeriesId, Date, Value)
    VALUES (@seriesId, @date, @value);
  `;

  const request = new Request(insertQuery, (err) => {
    if (err) {
      console.log(err)
      context.log.error(err);
      throw err;
    } else {
      context.log('Request made successfully');
      console.log('Request made successfully');
      connection.close();
    }
  });

  const item = data

  request.addParameter('seriesId', TYPES.NVarChar, item.seriesId);
  request.addParameter('date', TYPES.Date, new Date(item.date));
  request.addParameter('value', TYPES.Float, item.value);

  try {
    console.log('Request made of:' + request.parameters)
    connection.execSql(request);
  } catch {
    // Handle the case when the connection is not in the LoggedIn state
    throw new Error('Connection is not in the LoggedIn state');
  }
}

/*
async function insertData(context, pool, data) {

    await pool.acquire().then(async (connection) => {
      const table = 'FredSeriesData'; // Replace with the name of your database table
      const insertQuery = `
        INSERT INTO ${table} (SeriesId, Date, Value)
        VALUES (@seriesId, @date, @value);
      `;
    
      for (const item of data) {
        await new Promise((resolve, reject) => {
          const request = new Request(insertQuery, (err) => {
            if (err) {
              console.log(err);
              context.log.error(err);
              reject(err);
            } else {
              context.log('Request made successfully');
              console.log('Request made successfully');
              resolve();
            }
          });
    
          request.addParameter('seriesId', TYPES.NVarChar, item.seriesId);
          request.addParameter('date', TYPES.Date, new Date(item.date));
          request.addParameter('value', TYPES.Float, item.value);
    
          connection.execSql(request);
        });
      }
      pool.release(connection);
      context.log('All requests made successfully');
      console.log('All requests made successfully');
    }).catch((err) => {
      console.error('Error acquiring connection from pool:', err);
      context.log.error('Error acquiring connection from pool:', err);
    });
  }
  */