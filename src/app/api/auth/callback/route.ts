import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function GET(req: NextRequest) {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code')

    if (code) {

        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if(!error){
             return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
        }

        console.log(error.message)

    }

   
}