// File Upload Service - Handles file uploads to Supabase Storage
import { supabase } from '../config/database.js'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false)
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(file, bucket = 'campaign-images') {
  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname)
    const fileName = `${uuidv4()}${fileExt}`
    const filePath = `brands/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      fileName: fileName
    }

  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(filePath, bucket = 'campaign-images') {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    return { success: true }

  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}