import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getCurrentUser } from "@/lib/auth-server"

const f = createUploadthing()

export const ourFileRouter = {
  contractUploader: f({ 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
      maxFileSize: "8MB",
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      console.log("Upload middleware triggered")
      
      try {
        // Get the current user
        const user = await getCurrentUser()
        console.log("User in upload middleware:", user)
        
        if (!user) {
          console.log("No user found in upload middleware")
          throw new UploadThingError("Unauthorized - Please sign in to upload contracts")
        }
        
        // Pass user id to onUploadComplete
        return { userId: user.id, userEmail: user.email }
      } catch (error) {
        console.error("Error in upload middleware:", error)
        throw new UploadThingError("Authentication failed - Please sign in again")
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", {
        userId: metadata.userId,
        userEmail: metadata.userEmail,
        fileName: file.name,
        fileSize: file.size,
        fileKey: file.key,
        fileUrl: file.url
      })
      
      // Return data that will be available on the client
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        key: file.key,
        name: file.name
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter