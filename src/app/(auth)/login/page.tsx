'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import Image from "next/image"
import Logo from "../../../../public/wedoclogo.svg"
import { Input } from "@/components/ui/input"
import Loader from "@/components/global/Loader"
import { login } from "@/lib/server-action/auth-action"

const formSchema = z.object({
    email: z.string().describe("Email").email({
        message: "Invalid Email",
    }),
    password: z.string().describe("Password").min(6, {
        message: "Password length can't be lesser than 6"
    })
})


const LoginPage = () => {
    const router = useRouter()
    const [submitError, setSubmitError] = useState('')
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (formData) => {
        const {error} = await login(formData)
       
        if(error.message){
            form.reset()
            setSubmitError(error.message)
            return
        }

        router.replace('/dashboard')
    }
    return (
        <Form {...form}>
            <form onChange={() => {
                if (submitError) setSubmitError('') }}
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col">
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

                {submitError && <FormMessage>{submitError}</FormMessage>}

                <Button type="submit" className="w-full p-6" size={"lg"} disabled={isLoading}>
                    {!isLoading ? 'Login' : <Loader/>}
                </Button>
                <span className="self-center">Don't have an account 
                <Link href={'/signup'} className="text-primary">Sign up</Link></span>

            </form>
        </Form>
    )
}

export default LoginPage