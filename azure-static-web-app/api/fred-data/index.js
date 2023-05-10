const sql = require('mssql');

module.exports = async function (context, req) {
  // Azure SQL Database configuration
  const config = {
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