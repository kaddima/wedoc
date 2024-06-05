import db from '@/lib/supabase/db'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

const DashboardPage = async () => {
  const supabase = createClient()

  const {data:{user}} = await supabase.auth.getUser()

  if(!user) return

  const workspace = await await db.query.workspaces.findFirst({
    where:(workspace, {eq})=>eq(workspace.workspaceOwner,user.id)
  })

  if(!workspace){

    return
  }

  redirect(`/dashboard/${workspace.id}`)


}

export default DashboardPage