'use client'

import { AuthUser } from "@supabase/supabase-js"
import { Subscription } from "../supabase/supabase.types"
import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { getUserSubscriptionStatus } from "../supabase/queries"
import { useToast } from "@/components/ui/use-toast"

type supabaseUserContextType = {
    user: AuthUser | null
    subscription: Subscription | null
}

const SupabaseUserContext = createContext<supabaseUserContextType>({
    user: null, subscription: null
})

export const useSupabaseUser = () => {
    return useContext(SupabaseUserContext)
}

interface supabaseUserProviderProps {
    children: React.ReactNode
}
export const supabaseUserProvider: React.FC<supabaseUserProviderProps> = ({
    children
}) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const supabase = createClient()
    const { toast } = useToast()
    //fetch user details

    useEffect(() => {

        const getUser = async () => {

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)
                const { data, error } = await getUserSubscriptionStatus(user.id)

                if (data) {
                    setSubscription(data)
                }

                if (error) {
                    toast({
                        title: 'Unexpected Error',
                        description: 'Oops! An unexpected error happened. Try again later.'
                    })
                }
            }
        }

        getUser()

    }, [supabase])
    return <SupabaseUserContext.Provider value={{ user, subscription }}>
        {children}
    </SupabaseUserContext.Provider>
}
