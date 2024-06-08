import {defineConfig} from 'drizzle-kit'
import {config} from 'dotenv'

config({ path: '.env' });

if(!process.env.DATABASE_URL){

    console.log('Cannot find database url')
}

export default defineConfig({

    schema: './src/lib/supabase/schema.ts',
    out:'./migrations',
    dialect:'postgresql',
    dbCredentials:{
        url:process.env.DATABASE_URL!,
        database: "postgres",
        port: 5432,
        host: "aws-0-eu-central-1.pooler.supabase.com",
        user: "postgres.ckeelqgchtllpvymrhic",
        password: process.env.PW || "",
    }
}) 

