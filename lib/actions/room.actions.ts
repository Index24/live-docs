'use server';

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';
import { title } from 'process';

export const createDocument = async ({userId, email}: CreateDocumentParams) => {
  const roomId = nanoid()

  try {
    const metadata = {
      creatorId: userId,
      email: email,
      title: 'Untitled ',
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write'],
    }

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: []
    });
    
    revalidatePath('/')

    return parseStringify(room);
  } catch (error) {
    console.error('Error creating room', error)
    return null
  }
}

export const getDocument = async ({ roomId, userId }: {roomId: string, userId: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    const hasAccess = Object.keys(room.usersAccesses).includes(userId)

    if (!hasAccess) {
      throw new Error('User does not have access to this room')
    }

    return parseStringify(room)
  } catch (error) {
    console.error('Error getting room', error)
  }
}

export const getDocuments = async ({ email }: {email: string}) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email})

    return parseStringify(rooms)
  } catch (error) {
    console.error('Error getting rooms', error)
  }
}

export const updateDocument = async ({ roomId, title }: {roomId: string, title: string}) => {
  try {
    const room = await liveblocks.updateRoom(roomId, {
      metadata: {
        title
      }
    })

    revalidatePath(`/documents/${roomId}`)

    return parseStringify(room)
  } catch (error) {
    console.error('Error updating room', error)
  }
}

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType
    }

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses
    })

    if (room) {
      const notificationId = nanoid()
      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId         
      })
    }

    revalidatePath(`/documents/${roomId}`)

    return parseStringify(room)
  } catch (error) {
    console.error('Error updating room access', error)
  }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    if (room.metadata.email === email) {
      throw new Error('Cannot remove the owner of the document')
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
    })

    revalidatePath(`/documents/${roomId}`)
    
    return parseStringify(updatedRoom)
  } catch (error) {
    console.error('Error removing collaborator', error)
  }
}

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId)
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    console.error('Error deleting room', error)
  }
}