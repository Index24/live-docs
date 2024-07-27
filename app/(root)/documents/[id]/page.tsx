import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const DocumentPage = async ({ params: {id}}: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect('/sign-in')
  }

  const room = await getDocument({ roomId: id, userId: clerkUser.id });

  if (!room) {
    redirect('/')
  }

  // TODO: Asses the permissions of the user to access the room (document)

  return (
    <div className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        currentUserType="editor"
        users={[]}
      />
    </div>
  )
}
export default DocumentPage