
/*
server.js -> entry point; starts the http server and nothing else
          -> starts the engine, binds to a port, listen to traffic
app.js -> handles all the express configuration, is the server
keeping these separate means we can test app.js without starting a real server
*/

import app from './app.js'
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});