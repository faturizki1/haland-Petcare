"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  bucket: string
  path: string
  onUploadComplete: (url: string) => void
  existingUrl?: string | null
  accept?: string
  maxSizeMB?: number
}

export function ImageUpload({
  bucket,
  path,
  onUploadComplete,
  existingUrl,
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: `File terlalu besar. Maksimal ${maxSizeMB}MB`, variant: "destructive" })
      return
    }

    setUploading(true)
    const supabase = createClient()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${path}/${fileName}`

    const { error } = await supabase.storage.from(bucket).upload(filePath, file)
    if (error) {
      toast({ title: "Gagal upload", description: error.message, variant: "destructive" })
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
    setPreview(publicUrl)
    onUploadComplete(publicUrl)
    setUploading(false)
    toast({ title: "Upload berhasil" })
  }

  function handleRemove() {
    setPreview(null)
    onUploadComplete("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-md border">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-0 top-0 rounded-bl-md bg-destructive p-0.5 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Mengupload..." : "Pilih Foto"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">Maks. {maxSizeMB}MB</p>
      </div>
    </div>
  )
}