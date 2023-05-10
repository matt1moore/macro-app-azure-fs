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