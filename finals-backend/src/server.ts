import express, { Application } from "express"
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler"
import userController from "./users/users.controller"
import accountsController from "./accounts/accounts.controller"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"

import fs from 'fs';
import { db, initialize } from "./_helpers/db"

// Initialize database
let isDbInitialized = false;
const dbInitPromise = initialize()
    .then(() => {
        isDbInitialized = true;
        console.log("Database initialized successfully");
    })
    .catch(err => {
        console.error("Database initialization failed:", err);
    });

// Middleware to ensure DB is ready
const dbCheck = (req: any, res: any, next: any) => {
    if (!isDbInitialized) {
        return res.status(503).json({ message: 'Database is still initializing or failed to connect. Please try again in a moment.' });
    }
    next();
};

const swaggerPath = path.join(__dirname, "swagger.yaml");
let swaggerDocument = {};
try {
    if (fs.existsSync(swaggerPath)) {
        const file = fs.readFileSync(swaggerPath, 'utf8');
        swaggerDocument = YAML.parse(file);
        console.log("Swagger document loaded successfully");
    } else {
        console.error("Swagger file NOT found at:", swaggerPath);
    }
} catch (e) {
    console.error("Failed to load swagger.yaml from:", swaggerPath, e);
}

const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use(cookieParser());

// Use CDN for Swagger UI assets to ensure they work on Vercel
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCssUrl: CSS_URL,
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.min.js"
    ]
}))
app.get("/", (req, res) => res.redirect("/api-docs"))

// Apply DB check middleware to all API routes
app.use(dbCheck);

app.use("/accounts", accountsController)
app.use("/users", userController)

app.use(errorHandler)

const PORT = process.env.PORT || 4000

if (process.env.NODE_ENV !== 'production') {
    dbInitPromise.then(() => {
        app.listen(PORT, () => {
            console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`)
        })
    });
}

export default app;