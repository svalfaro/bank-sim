// entry point, starts server
import app from './app.js'
import dotenv from 'dotenv'

dotenv.config();

// reminder: process.env.PORT always exists in Node
const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
})