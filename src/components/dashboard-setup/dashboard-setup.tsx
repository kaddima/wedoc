'use client'
import { AuthUser } from '@supabase/supabase-js'
import React, { useState } from 'react'
import {
	Card, CardContent,
	CardDescription, CardHeader, CardTitle
} from '../ui/card';
import { v4 } from 'uuid'
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {SubmitHandler, useForm } from 'react-hook-form';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';
import { createWorkspace } from '@/lib/supabase/queries';
import { useAppState } from '@/lib/providers/state-provider';
import { Button } from '../ui/button';
import Loader from '../global/Loader';

interface DashboardSetupProps {
	user: AuthUser;
	subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({ subscription, user }) => {

	const { toast } = useToast()
	const router = useRouter()
	const [selectedEmoji, setSelectedEmoji] = useState('💼')
	const { dispatch } = useAppState()
	const supabase = createClient()
	const {
		register,
		handleSubmit,
		reset, formState: { isSubmitted: isLoading, errors }
	} = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
		mode: "onChange",
		defaultValues: {
			logo: '',
			workspaceName: ''
		}
	})

	const onSubmit: SubmitHandler<z.infer<typeof CreateWorkspaceFormSchema>> = async (value) => {
		const file = value.logo?.[0]
		let filePath = null;
		const workspaceUUID = v4()

		 if (file) {

			try {
				const { data, error } = await supabase.storage
					.from('workspace-logos')
					.upload(`workspaceLogo.${workspaceUUID}`, file,
						{ cacheControl: "3600", upsert: true });

				if (error) throw new Error(error.message);
				filePath = data.path
			} catch (error) {
				console.log('Error ', error)
				toast({
					variant: 'destructive',
					title: 'Error could not upload your workspace logo'
				})
			}

			try {
				const newWorkspace: workspace = {
					data: null,
					createdAt: new Date().toISOString(),
					iconId: selectedEmoji,
					id: workspaceUUID,
					inTrash: '',
					title: value.workspaceName,
					workspaceOwner: user.id,
					logo: filePath || null,
					bannerUrl: ''
				}

				const { data, error: createError } = await createWorkspace(newWorkspace)
				if (createError) {
					throw new Error();
				}

				dispatch({
					type: 'ADD_WORKSPACE',
					payload: { ...newWorkspace, folders: [] },
				});

				toast({
					title: 'Workspace Created',
					description: `${newWorkspace.title} has been created successfully.`,
				});

				router.replace(`/dashboard/${newWorkspace.id}`);

			} catch (error) {

				console.log(error, 'Error');
				toast({
					variant: 'destructive',
					title: 'Could not create your workspace',
					description:
						"Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
				});
			} finally {
				reset();
			}
		} 
	}

	return (
		<Card className='w-[800px] h-screen sm:h-auto'>
			<CardHeader>
				<CardTitle>Create A workspace</CardTitle>
				<CardDescription>
					Lets create a private workspace to get you started. You can
					add collaborators later from the workspace setting tab.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='flex flex-col gap-4'>
						<div className='flex items-center gap-4'>
							<div className='text-5xl'>
								<EmojiPicker getValue={(emoji) => { setSelectedEmoji(emoji) }}>
									{selectedEmoji}
								</EmojiPicker>
							</div>
							<div className='w-full'>
								<Label htmlFor="workspaceName" className='text-sm text-muted-foreground'>Name</Label>
								<Input id="workspaceName" placeholder='Workspace Name'
									type='text' disabled={isLoading} {...register('workspaceName', { required: "workspace name is required" })} />
								<small className='text-red-600'>
									{errors?.workspaceName?.message?.toString()}
								</small>
							</div>
						</div>
						<div className='w-full'>
							<Label htmlFor="logo" className='text-sm text-muted-foreground'>Workspace logo</Label>
							<Input id="logo" placeholder='Workspace Logo'
								type='file' accept='image/*' disabled={isLoading && subscription?.status !== 'active'} {...register('logo', { required: false })} />
							<small className='text-red-600'>
								{errors?.logo?.message?.toString()}
							</small>
							{subscription?.status !== 'active' && (
								<small
									className="text-muted-foreground block">
									To customize your workspace, you need to be on a Pro Plan
								</small>
							)}
						</div>
						<div className="self-end">
							<Button
								disabled={isLoading}
								type="submit"
							>
								{!isLoading ? 'Create Workspace' : <Loader />}
							</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default DashboardSetup