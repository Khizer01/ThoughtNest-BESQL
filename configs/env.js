import { config } from "dotenv";

if (process.env.NODE_ENV !== 'production') {
  config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
}

export const {
    PORT,
    NODE_ENV,
    URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CLIENT_ID,
    CLIENT_SEC,
    FRONTEND_URL,
    SMTP_EMAIL,
    SMTP_PASSWORD,
    OPENAI_API_KEY,
    AI_API_KEY,
    GEMINI_AI_KEY,
    SQL_USER,
    SQL_PASSWORD,
    SQL_DATABASE,
    SQL_SERVER,
    SQL_PORT,
} = process.env;