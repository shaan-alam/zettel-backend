import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/", routes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT} 🚀`));
