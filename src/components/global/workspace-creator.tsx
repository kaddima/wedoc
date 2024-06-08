'use client'
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider'
import { User, workspace } from '@/lib/supabase/supabase.types'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Lock, Plus, Share } from 'lucide-react'
import { Button } from '../ui/button'
import { v4 } from 'uuid'
import { addCollaborators, createWorkspace } from '@/lib/supabase/queries'
import CollaboratorSearch from './collaborator-search'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useToast } from '../ui/use-toast'



const WorkspaceCreator = () => {
    const { user } = useSupabaseUser()
    const router = useRouter()
    const [permissions, setPermissions] = useState('private')
    const [title, setTitle] = useState('')
    const [collaborators, setCollaborators] = useState<User[]>([])
    const [isLoading,setIsLoading] = useState(false)
    const {toast} = useToast()

    const addCollaborator = (user: User) => {
        setCollaborators([...collaborators, user]);
    }

    const removeCollaborators = (user: User) => {
        setCollaborators(collaborators.filter((c) => c.id !== user.id))
    }

    const createItem = async () => {
        setIsLoading(true)
        const uuid = v4()

        if (user?.id) {

            const newWorkspace: workspace = {
                data: null,
                id: uuid,
                created_at: new Date().toISOString(),
                icon_id: '💼',
                in_trash: '',
                title,
                workspace_owner: user.id,
                logo: null,
                banner_url: ''
            }

            if (permissions === 'private') {
                await createWorkspace(newWorkspace);
                toast({title:'success',description:"Created the workspace"})
                router.refresh();
            }

            if (permissions === 'shared') {
                await createWorkspace(newWorkspace)
                await addCollaborators(collaborators, uuid)
                toast({title:'success',description:"Created the workspace"})
                router.refresh()
            }
        }

        setIsLoading(false)
    }

    return (
        <div className='flex gap-4 flex-col'>
            <div>
                <Label htmlFor='name' className='text-sm text-muted-foreground'>
                    Name
                </Label>
                <div className='flex justify-center gap-2'>
                    <Input name='name' value={title} placeholder='workspace name'
                        onChange={(e) => setTitle(e.target.value)} />
                </div>
            </div>
            <>
                <Label htmlFor='permissions' className='text-sm text-muted-foreground'>
                    Permission
                </Label>
                <Select onValueChange={(val) => setPermissions(val)} defaultValue={permissions}>
                    <SelectTrigger className='w-full h-26 -mt-3'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="private">
                                <div className='p-2 flex gap-4 justify-center items-center'>
                                    <Lock />
                                    <article className='text-left flex flex-col'>
                                        <span>Private</span>
                                        <p>Your workspace is private to you. You can choose to show it later</p>
                                    </article>
                                </div>
                            </SelectItem>
                            <SelectItem value="shared">
                                <div className='p-2 flex gap-4 justify-center items-center'>
                                    <Share />
                                    <article className='text-left flex flex-col'>
                                        <span>Shared</span>
                                        <p>you can invite collaborators</p>
                                    </article>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </>

            {permissions === 'shared' && <div>
                <CollaboratorSearch existingCollaborators={collaborators}
                    getCollaborators={(user) => { addCollaborator(user) }}>
                    <Button type='button' className='button text-sm mt-4'>
                        <Plus />
                        Add collaborators
                    </Button>
                </CollaboratorSearch>

                <div className='mt-4'>
                    <span className='text-sm text-muted-foreground'>
                        Collaborators {collaborators.length || ''}
                    </span>
                    <ScrollArea className='h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20'>
                        {collaborators.length ?
                            collaborators.map((c) => (
                                <div className='p-4 flex justify-between items-center w-full' key={c.id}>
                                    <div className="flex gap-4 items-center w-2/3">
                                        <Avatar>
                                            <AvatarImage src={`/avatars/7.png`} />
                                            <AvatarFallback>p7</AvatarFallback>
                                        </Avatar>
                                        <div className='text-sm gp-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]'>
                                            {c.email}
                                        </div>
                                    </div>

                                    <Button variant={'secondary'} onClick={() => removeCollaborators(c)} className='flex-1'>
                                        Remove
                                    </Button>
                                </div>
                            )) :
                            <div className='absolute right-0 top-0 bottom-0 left-0 flex justify-center items-center'>
                                <span className='text-muted-foreground text-sm'>You have no collaborators</span>
                            </div>
                            }
                    </ScrollArea>
                </div>
            </div>}

            <Button type='button' variant={'secondary'} onClick={createItem}
                disabled={!title || (permissions === 'shared' && collaborators.length === 0) || isLoading}>
                Create
            </Button>
        </div>
    )
}

export default WorkspaceCreator