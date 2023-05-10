const express = require('express');
const sql = require('mssql');
const app = express();

const config = {
  server: 'final-economic-server.database.windows.net',
  database: 'main_fred_db',
  user: 'finaleconadmin',
  password: 'Beaches3266DS!',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// CORS middleware
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/average-data', async (req, res) => {
  try {
    // Connect to the Azure SQL Database
    console.log("Entering current data fucntion")
    await sql.connect(config);

    // Query to retrieve most recent values of economic indicators
    console.log(req.query.indicator)
    console.log(req.params.indicator)
    const query = `SELECT AVG(Value) AS AverageFSD
                    FROM FredSeriesData
                    WHERE SeriesId = '${req.query.indicator}'`

    // Execute the query
    const result = await sql.query(query);
    console.log(result.recordset)
    // Return the retrieved data as JSON response
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving data from Azure SQL Database:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the database connection
    // sql.close();
  }
});

app.get('/current-data', async (req, res) => {
    try {
      // Connect to the Azure SQL Database
      console.log("Entering current data fucntion")
      await sql.connect(config);
  
      // Query to retrieve most recent values of economic indicators
      console.log(req.query.indicator)
      console.log(req.params.indicator)
      const query = `SELECT Value
                    FROM FredSeriesData
                    WHERE SeriesId = '${req.query.indicator}'
                        AND Date = (
                            SELECT MAX(Date)
                            FROM FredSeriesData
                            WHERE SeriesId = '${req.query.indicator}'
                        );`
  
      // Execute the query
      const result = await sql.query(query);
      console.log(result.recordset)
      // Return the retrieved data as JSON response
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error retrieving data from Azure SQL Database:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection
      // sql.close();
    }
  });

  app.get('/chart-data', async (req, res) => {
    try {
      // Connect to the Azure SQL Database
      console.log("Entering current data fucntion")
      await sql.connect(config);
  
      // Query to retrieve most recent values of economic indicators
      console.log(req.query.indicator)
      console.log(req.params.indicator)
      const query = `
        SELECT Value, Date
        FROM FredSeriesData
        WHERE SeriesId = '${req.query.indicator}';`
  
      // Execute the query
      const result = await sql.query(query);
      console.log(result.recordset)
      // Return the retrieved data as JSON response
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error retrieving data from Azure SQL Database:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the database connection
      sql.close();
    }
  });

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});


/*
const sql = require('mssql');

const AZURE_CONN_STRING = process.env["AzureSQLConnectionString"];

module.exports = async function (context, req) {
  // Azure SQL Database configuration
  const pool = await sql.connect(AZURE_CONN_STRING);    

  try {
    // Connect to the Azure SQL Database
    await sql.connect(config);

    // Query to retrieve most recent values of economic indicators
    const query = `SELECT SeriesId, MAX(Date) AS MaxDate, Value 
                FROM FredSeriesData 
                WHERE SeriesId = '${req.query.indicator}' 
                GROUP BY SeriesId`;

    // Execute the query
    const result = await sql.query(query);

    // Return the retrieved data as JSON response
    context.res = {
      status: 200,
      body: result.recordset
    };
  } catch (error) {
    console.error('Error retrieving data from Azure SQL Database:', error);
    context.res = {
      status: 500,
      body: 'Internal Server Error'
    };
  } finally {
    // Close the database connection
    sql.close();
  }
};

*/