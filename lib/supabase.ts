import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not set')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
)

// Server-side Supabase client (for API routes - bypasses RLS)
// Uses service role key which has admin privileges
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
)

// Bucket name for storing resource documents
export const RESOURCES_BUCKET = 'resource-documents'

/**
 * Upload a file to Supabase storage
 * @param file - The file to upload
 * @param userId - The user ID uploading the file
 * @param resourceId - The resource ID (optional, for naming)
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToSupabase(
  file: File,
  userId: string,
  resourceId?: string
): Promise<string> {
  try {
    // Create unique file name with timestamp
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    console.log(`📤 Uploading file to Supabase: ${fileName}`)

    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(RESOURCES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    console.log('✅ File uploaded successfully:', data)

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(RESOURCES_BUCKET)
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl
    console.log('🔗 Public URL:', publicUrl)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase storage
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteFileFromSupabase(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the public URL
    const urlParts = fileUrl.split(`/${RESOURCES_BUCKET}/`)
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL')
    }

    const filePath = urlParts[1]
    console.log(`🗑️ Deleting file from Supabase: ${filePath}`)

    const { error } = await supabase.storage
      .from(RESOURCES_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('❌ Supabase delete error:', error)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log('✅ File deleted successfully')
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
