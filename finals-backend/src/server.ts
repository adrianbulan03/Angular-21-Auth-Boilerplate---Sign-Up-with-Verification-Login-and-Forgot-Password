import express, { Application } from "express"
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler"
import { initialize } from "./_helpers/db"
import userController from "./users/users.controller"
import accountsController from "./accounts/accounts.controller"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"

import fs from 'fs';

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
app.use("/accounts", accountsController)
app.use("/users", userController)

app.use(errorHandler)

const PORT = process.env.PORT || 4000

if (process.env.NODE_ENV !== 'production') {
    initialize()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`)
            })
        }).catch((err) => {
            console.log(`Failed to initialize database::`, err)
        })
} else {
    // For Vercel/Production: Initialize DB but don't call listen (Vercel handles it)
    initialize().catch(err => console.error("DB Init Error:", err));
}

export default app;