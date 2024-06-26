import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config"
import * as schema from '../../../migrations/schema'
import { migrate } from "drizzle-orm/postgres-js/migrator";


if(!process.env.DATABASE_URL){
    
    console.log('no database url')
}

const client = postgres(process.env.DATABASE_URL as string,{max:1})
const db = drizzle(client, {schema})

export default db;
