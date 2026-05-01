
/*
server.js -> entry point; starts the http server and nothing else
          -> starts the engine, binds to a port, listen to traffic
app.js -> handles all the express configuration, is the server
keeping these separate means we can test app.js without starting a real server
*/

import 'dotenv-safe/config.js';
import app from './app.js';
import { testConnection } from './db/data.js';

const PORT = Number(process.env.PORT) || 3000;

/*
 * verify database connection before accepting traffic
 * if the database is unreachable, the server exists immediately
 * a server that can't reach its database is NOT operational
 */

async function start() {
    try {
        await testConnection();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

start();



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});