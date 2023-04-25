import * as dotenv from 'dotenv'
dotenv.config()
export const CWD = process.cwd()
export const CONFIG_FILE_NAME = 'configx.json'
const DEVELOPMENT_DIR = 'src/example/generatedConfig'
export const OUTPUT_DIR =
  process.env.ENVIRONMENT === 'STAGING' ? DEVELOPMENT_DIR : 'configx'
