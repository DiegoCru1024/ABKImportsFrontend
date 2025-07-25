import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"

import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

// Create some dummy initial files


// Props para controlar el componente desde el padre
interface FileUploadComponentProps {
  onFilesChange?: (files: File[]) => void;
  resetCounter?: any;
}

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const iconMap = {
    pdf: {
      icon: FileTextIcon,
      conditions: (type: string, name: string) =>
        type.includes("pdf") ||
        name.endsWith(".pdf") ||
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx"),
    },
    archive: {
      icon: FileArchiveIcon,
      conditions: (type: string, name: string) =>
        type.includes("zip") ||
        type.includes("archive") ||
        name.endsWith(".zip") ||
        name.endsWith(".rar"),
    },
    excel: {
      icon: FileSpreadsheetIcon,
      conditions: (type: string, name: string) =>
        type.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx"),
    },
    video: {
      icon: VideoIcon,
      conditions: (type: string) => type.includes("video/"),
    },
    audio: {
      icon: HeadphonesIcon,
      conditions: (type: string) => type.includes("audio/"),
    },
    image: {
      icon: ImageIcon,
      conditions: (type: string) => type.startsWith("image/"),
    },
  }

  for (const { icon: Icon, conditions } of Object.values(iconMap)) {
    if (conditions(fileType, fileName)) {
      return <Icon className="size-5 opacity-60" />
    }
  }

  return <FileIcon className="size-5 opacity-60" />
}

const getFilePreview = (file: {
  file: File | { type: string; name: string; url?: string }
}) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const renderImage = (src: string) => (
    <img
      src={src}
      alt={fileName}
      className="size-full rounded-t-[inherit] object-contain"
      //className="h-full w-full rounded-t-[inherit] object-cover"
    />
  )

  return (
    <div className="bg-accent flex h-24 items-center justify-center overflow-hidden rounded-t-[inherit]">
      {fileType.startsWith("image/") ? (
        file.file instanceof File ? (
          (() => {
            const previewUrl = URL.createObjectURL(file.file)
            return renderImage(previewUrl)
          })()
        ) : file.file.url ? (
          renderImage(file.file.url)
        ) : (
          <ImageIcon className="size-5 opacity-60" />
        )
      ) : (
        getFileIcon(file)
      )}
    </div>
  )
}

export default function FileUploadComponent({ onFilesChange, resetCounter }: FileUploadComponentProps) {
  const maxSizeMB = 16
  const maxSize = maxSizeMB * 1024 * 1024 // 20MB default
  const maxFiles = 20

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
  })

  const prevFilesRef = useRef<string[]>([])

  useEffect(() => {
    clearFiles()
  }, [resetCounter])

  useEffect(() => {
    if (onFilesChange) {
      const uploadedFiles = files
        .map(f => f.file)
        .filter((file): file is File => file instanceof File)
  
      const currentNames = uploadedFiles.map(f => f.name + f.size).sort()
      const prevNames = prevFilesRef.current
  
      const hasChanged = JSON.stringify(prevNames) !== JSON.stringify(currentNames)
  
      if (hasChanged) {
        prevFilesRef.current = currentNames
        setTimeout(() => {
          onFilesChange(uploadedFiles)
        }, 0)
      }
    }
  }, [files, onFilesChange])

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px] bg-background dark:bg-background"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium dark:text-gray-200">
                Archivos ({files.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" onClick={openFileDialog} >
                  <UploadIcon
                    className="-ms-0.5 size-3.5 opacity-60 text-orange-500"
                    aria-hidden="true"
                  />
                  Agregar archivos
                </Button>
                <Button variant="outline" size="sm" type="button" onClick={clearFiles}>
                  <Trash2Icon
                    className="-ms-0.5 size-3.5 opacity-60 text-orange-500"
                    aria-hidden="true"
                  />
                  Eliminar todos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-background dark:bg-gray-800 relative flex flex-col rounded-md border dark:border-gray-700"
                >
                  {getFilePreview(file)}
                  <Button
                    onClick={() => removeFile(file.id)}
                    size="icon"
                    type="button"
                    className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                    aria-label="Remove image"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                  <div className="flex min-w-0 flex-col gap-0.5 border-t dark:border-gray-700 p-3">
                    <p className="truncate text-[13px] font-medium dark:text-gray-200">
                      {file.file.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background dark:bg-gray-800 mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border dark:border-gray-700"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium dark:text-gray-200">Arrastre sus archivos aquí</p>
            <p className="text-muted-foreground text-xs">
              Max {maxFiles} archivos ∙ Max {maxSizeMB}MB c/u
            </p>
            <Button variant="outline" type="button" className="mt-4 text-orange-500" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Seleccionar archivos
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
