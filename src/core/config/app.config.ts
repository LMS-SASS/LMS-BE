import * as Joi from "joi";

export const APP_CONFIG_VALIDATION = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),

  // Database
  DB_HOST: Joi.string().default("localhost"),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().default("lms_sass"),
  DB_USER: Joi.string().default("lms_sass"),
  DB_PASSWORD: Joi.string().default("lms_sass"),

  // Elasticsearch
  ES_NODE: Joi.string().default("http://localhost:9200"),

  // Keycloak
  KEYCLOAK_URL: Joi.string().default("http://localhost:8080"),
  KEYCLOAK_REALM: Joi.string().default("lms-sass"),
  KEYCLOAK_CLIENT_ID: Joi.string().default("lms-sass-api"),

  // Gutendex (external catalog import source)
  GUTENDEX_BASE_URL: Joi.string().default("https://gutendex.com"),

  // Authors mock (external mock catalog source)
  AUTHORS_MOCK_BASE_URL: Joi.string().default(
    "https://my-json-server.typicode.com/dmitrijt9/book-api-mock",
  ),
});
