'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Logo from "../../../../public/wedoclogo.svg"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MailCheck } from 'lucide-react'
import { FormSchema } from '@/lib/types'
import { signup } from '@/lib/server-action/auth-action'


const signUpFormSchema = z.object({
    email: z.string().describe('Email').email({ message: "Invalid email" }),
    password: z.string().describe('password').min(6, 'Password must be minimum of 6 characters'),
    confirmPassword: z.string().describe("Confirm Password").min(6, 'Password must be minimum of 6 characters')
}).refine((data) => {
    return data.password === data.confirmPassword
}, { message: "Password don't match", path: ['confirmPassword'] })


const Signup = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const [submitError, setSubmitError] = useState('')
    const [confirmation, setConfirmation] = useState(false)


    const codeExhangeError = useMemo(() => {
        if (!searchParams) return ''

        return searchParams.get('error_description')
    }, [searchParams])


    const confirmationAndErrorStyles = useMemo(() => {
        return clsx('bg-primary',
            {
                'bg-red-500/10': codeExhangeError, 'border-red-500/50': codeExhangeError,
                'text-red-700': codeExhangeError
            })
    }, [])

    const form = useForm<z.infer<typeof signUpFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(signUpFormSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' }
    })
    const isLoading = form.formState.isSubmitting

    const onSubmit = async ({email,password}:z.infer<typeof FormSchema>) => {

        const {error} = await signup({email,password})

        if(error.message){
            form.reset()
            setTimeout(()=>{setSubmitError(error.message!)},0);
            return;
        }

        setConfirmation(true)
     }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => {
                if (submitError) setSubmitError('')
            }} className='w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col'>
                <Link href={'/'} className="w-full flex justify-left items-center">
                    <Image src={Logo} alt="WebDoc logo" width={50} height={50} />
                    <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">WeDoc</span>
                </Link>
                <FormDescription className="text-forgroound/60">
                    An all-in-one Collaboration and Productivity Platform
                </FormDescription>
                <FormField disabled={isLoading} control={form.control} name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input type="email" placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                <FormField disabled={isLoading} control={form.control} name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input type="password" placeholder="Enter Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                <FormField disabled={isLoading} control={form.control} name="confirmPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input type="password" placeholder="Enter confirm password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                {submitError && <FormMessage>{submitError}</FormMessage>}
                {!confirmation && !codeExhangeError && <>
                    <Button type='submit' className='w-full p-6' disabled={isLoading}>
                        {!isLoading ? 'Sign Up' : <Loader />}
                    </Button>
                </>}
                <span className="self-center">Already have an account
                    <Link href={'/login'} className="text-primary">Sign in</Link>
                </span>
                {(confirmation || codeExhangeError) && <>
                    <Alert className={confirmationAndErrorStyles}>
                        {!codeExhangeError && <MailCheck className='h-4 w-4'/>}
                        <AlertTitle>
                            {codeExhangeError ? "Invalid Link" : "check your email"}
                        </AlertTitle>
                        <AlertDescription>
                            {codeExhangeError || "An email confirmation has been sent"}
                        </AlertDescription>
                    </Alert>
                </>}
            </form>
        </Form>
    )
}

export default Signup