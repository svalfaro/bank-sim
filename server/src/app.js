// express setup + middleware
// routes -> mapping endpoints to CONTROLLERS
// error handling

import express from 'express';

const app = express();

app.use(express.json()); // parse JSON requests
app.use(express.urlencoded({extended: false}));

export default app;