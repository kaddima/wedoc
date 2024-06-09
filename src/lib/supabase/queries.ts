'use server'
import { eq, notExists, and, ilike } from "drizzle-orm";
import { files, workspaces, folders, users,collaborators } from "../../../migrations/schema"
import db from "./db"
import { Folder, Subscription, workspace, File, User } from "./supabase.types"
import { validate } from 'uuid';
import { title } from "process";
//import { collaborators } from "./schema";


export const createWorkspace = async (workspace: workspace) => {

	try {
		await db.insert(workspaces).values(workspace)
		return { data: null, error: null }
	} catch (error) {
		console.log(error)
		return { data: null, error: 'Error' }
	}
}

export const getUserSubscriptionStatus = async (userId: string) => {
	try {
		const data = await db.query.subscriptions.findFirst({
			where: (s, { eq }) => eq(s.user_id, userId),
		});
		if (data) return { data: data as Subscription, error: null };
		else return { data: null, error: null };
	} catch (error) {
		console.log(error);
		return { data: null, error: `Error` };
	}
};

export const getFiles = async (folderId: string) => {
	const isValid = validate(folderId);
	if (!isValid) return { data: null, error: 'Error' };
	try {
		const results = (await db
			.select()
			.from(files)
			.orderBy(files.created_at)
			.where(eq(files.folder_id, folderId))) as File[] | [];
		return { data: results, error: null };
	} catch (error) {
		console.log(error);
		return { data: null, error: 'Error' };
	}
};

export const getFolders = async (workspaceId: string) => {
	const isValid = validate(workspaceId)
	if (!isValid) {

		return { data: null, error: "Error" }
	}

	try {
		const results: Folder[] | [] = await db.select().from(folders)
			.orderBy(folders.created_at)
			.where(eq(folders.workspace_id, workspaceId))

		return { data: results, error: null }

	} catch (error) {
		return { data: null, error: 'Error' }
	}
}

export const getPrivateWorkspaces = async (userId: string) => {
	if (!userId) return []

	const privateWorkspaces = await db.select({
		id: workspaces.id,
		created_at: workspaces.created_at,
		workspace_owner: workspaces.workspace_owner,
		title: workspaces.title,
		icon_id: workspaces.icon_id,
		data: workspaces.data,
		in_trash: workspaces.in_trash,
		logo: workspaces.logo

	}).from(workspaces).where(
		and(
			notExists(
				db
					.select()
					.from(collaborators)
					.where(eq(collaborators.workspace_id, workspaces.id))
			),
			eq(workspaces.workspace_owner, userId)
		)
	) as workspace[]

	return privateWorkspaces
}

export const getCollaboratingWorkspaces = async (userId: string) => {
	if (!userId) return []

	const collaboratedWorkspaces = await db.select({
		id: workspaces.id,
		created_at: workspaces.created_at,
		workspace_owner: workspaces.workspace_owner,
		title: workspaces.title,
		icon_id: workspaces.icon_id,
		data: workspaces.data,
		in_trash: workspaces.in_trash,
		logo: workspaces.logo

	})
		.from(users)
		.innerJoin(collaborators, eq(users.id, collaborators.user_id))
		.innerJoin(workspaces, eq(collaborators.workspace_id, workspaces.id))
		.where(eq(users.id, userId)) as workspace[]

	return collaboratedWorkspaces

}

export const getSharedWorkspaces = async (userId: string) => {
	if (!userId) return []

	const sharedWorkspaces = await db.selectDistinct({
		id: workspaces.id,
		created_at: workspaces.created_at,
		workspace_owner: workspaces.workspace_owner,
		title: workspaces.title,
		icon_id: workspaces.icon_id,
		data: workspaces.data,
		in_trash: workspaces.in_trash,
		logo: workspaces.logo

	})
		.from(workspaces)
		.orderBy(workspaces.created_at)
		.innerJoin(collaborators, eq(collaborators.workspace_id, workspaces.id))
		.where(eq(workspaces.workspace_owner, userId)) as workspace[]

	return sharedWorkspaces

}

export const addCollaborators = async (users: User[], workspaceId: string) => {

	const response = users.forEach(async (user: User) => {
		const userExists = await db.query.collaborators.findFirst({
			where: (u, { eq }) => {

				return and(eq(u.user_id, user.id), eq(u.workspace_id, workspaceId))
			}
		})

		if (!userExists) {
			await db.insert(collaborators).values({ workspace_id:workspaceId, user_id: user.id })
		}
	})
}

export const getUsersFromSearch = async (email: string) => {
	if (!email) return [];

	const accounts = db.select().from(users)
		.where(ilike(users.email, `${email}%`))
		
	return accounts
}
