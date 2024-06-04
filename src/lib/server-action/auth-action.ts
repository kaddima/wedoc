'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { FormSchema } from '../types'

export async function login({ email, password }: z.infer<typeof FormSchema>) {

    const supabase = createClient()
    const response = await supabase.auth.signInWithPassword({ email, password })

    return response
}

export async function signup({ email, password }: z.infer<typeof FormSchema>) {
    const supabase = createClient()

    const {data} = await supabase.from('profile').select('*').eq('email', email)
    
    if(data?.length) return {error:{message:"User already exists", data}}
    const response = await supabase.auth.signUp({ email, password,options:{emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`} })

    return response
}