import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { engine } from 'express-handlebars'

// __dirname doesn't exist in ES modules - this recreates it
const __filename = fileURLToPath(import.meta.url); // 'import' points to the current file
const __dirname = dirname(__filename)

const app = express();

/*
------*------- LOGGING ------*-------
OWASP A09:2025 SECURITY LOGGING AND MONITORING
first layer of observability; will take notice of unusual patterns: repeated 404s, 401 floods
in production, morgan output feeds into log aggregation (datadog, splunk)

morgan logs every http req: method, route, status code, response time
'dev' format: GET /dashboard 200 4.231ms
*/
app.use(morgan('dev'));

/*
------*------- TEMPLATE ENGINE (HANDLEBARS) ------*-------
OWASP A05:2025 INJECTION PREVENTION (XSS)
server-side rendering means the server controls exactly what html
reaches the browser; no client-side template injection surface.
tells express to use handlebars for rendering .hbs files
*/

app.engine('hbs', engine({
    extname: '.hbs', // registers handlebars as a template engine, files .hbs
    defaultLayout: 'main', // every page rendered gets automatically wrapped in views/layouts...main.hbs
    layoutsDir: join(__dirname, '..views/layout'),
    partialsDir: join(__dirname, '../views/partials'), // reusable chunks; nav, footer, err msgs
}));

// communicates with exp, when a route calls res.render(), look for .hbs files in the views/ folder
app.set('view engine', 'hbs');
app.set('views', join(__dirname, '../views'));

/*
------*------- STATIC FILES ------*-------
serves css, js imgs from /public folder without going through a route
*/
app.use(express.static(join(__dirname, '../../public')));

/*
------*------- PARSING ------*-------
lets express read form submissions and json request bodies
*/
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/*
------*------- ROUTES ------*-------
TODO
*/
app.get('/',(req, res) => {
    res.send('Bank Sim is running.')
});

export default app;