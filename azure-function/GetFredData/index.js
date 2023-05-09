const axios = require('axios');
const { Connection, Request } = require('tedious');
const { TYPES } = require('tedious')
require('dotenv').config();

module.exports = async function (context, req) {
  try {
    // Fetch data from FRED API
    const unemploymentData = await fetchData('UNRATE');
    const cpiInflationData = await fetchData('CPIAUCSL');
    const gdpPerCapitaData = await fetchData('A939RX0Q048SBEA');
    const interestRatesData = await fetchData('DFF');
    const housingInflationData = await fetchData('USSTHPI');
    const sp500Data = await fetchData('SP500');

    // Store data in Azure Database
    await storeDataInAzureDB(context, [
      unemploymentData,
      cpiInflationData,
      gdpPerCapitaData,
      interestRatesData,
      housingInflationData,
      sp500Data,
    ]);

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

function insertData(context, connection, data) {
  const table = 'FredSeriesData'; // Replace with the name of your database table

  const insertQuery = `
    INSERT INTO ${table} (SeriesId, Date, Value)
    VALUES (@seriesId, @date, @value);
  `;

  let isFirstRequest = true;
  data.forEach((item) => {
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

  request.addParameter('seriesId', TYPES.NVarChar, item.seriesId);
  request.addParameter('date', TYPES.Date, new Date(item.date));
  request.addParameter('value', TYPES.Float, item.value);

  if (connection.state.name === 'LoggedIn' && isFirstRequest) {
    console.log('Request made of:' + request.parameters)
    connection.execSql(request);
    isFirstRequest = false;
  } else if (connection.state.name === 'SentClientRequest' || connection.state.name === 'LoggedIn'){
    // More requests need to happen still
    console.log("Awaiting Client")
    request.on('requestCompleted', () => {
      console.log('Following requests made of:' + request.parameters)
      connection.execSql(request);
    });
  } else {
    // Handle the case when the connection is not in the LoggedIn state
    throw new Error('Connection is not in the LoggedIn state');
  }
  });
}