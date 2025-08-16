import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "./db";
import "./models/models";
import cors from "cors";
import router from "./routes/index";
import errorHandler from "./middleware/ErrorHandlingMiddleware";
import fileUpload from "express-fileupload";

const app = express();
const PORT = process.env.PORT || 5002;
app.use(cors())
app.use(express.json())
app.use(fileUpload())
app.use("/api", router)
app.use(errorHandler)

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on server ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};
start();
