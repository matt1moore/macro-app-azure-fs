const sql = require('mssql');

module.exports = async function (context, req) {
  // Azure SQL Database configuration
  const config = {
    server: 'your-server-name.database.windows.net',
    database: 'your-database-name',
    user: 'your-username',
    password: 'your-password',
    options: {
      encrypt: true,
      trustServerCertificate: false
    }
  };

  try {
    // Connect to the Azure SQL Database
    await sql.connect(config);

    // Query to retrieve economic indicator data
    const query = 'SELECT * FROM EconomicIndicators';

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