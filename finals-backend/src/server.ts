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

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"))

const app: Application = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/", (req, res) => res.redirect("/api-docs"))
app.use("/accounts", accountsController)
app.use("/users", userController)

app.use(errorHandler)

const PORT = process.env.PORT || 4000


initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`)
            console.log(`TEST WITH: POST /users with {email, password, ....}`)
        })
    }).catch((err) => {
        console.log(`Failed to initialize database::`, err)
        process.exit(1)
    })