import { Download, FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface CacesFileUploadProps {
  value?: string;
  onChange?: (file: string) => void;
  label?: string;
}

export function CacesFileUpload({
  value,
  onChange,
  label,
}: CacesFileUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server here
      // For now, we'll just use the file name
      onChange?.(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange?.(file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange?.("");
  };

  const handleDownload = () => {
    // In a real app, you would trigger a download of the actual file
    console.log("Downloading file:", value);
    window.open(value, "_blank");
  };

  if (value) {
    return (
      <div className="space-y-2">
        {label && <label className="font-medium text-sm">{label}</label>}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{value}</p>
            <p className="text-muted-foreground text-xs">Document CACES</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 w-8"
              onClick={handleDownload}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8"
              onClick={handleRemove}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="font-medium text-sm">{label}</label>}
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          accept=".pdf,.jpg,.jpeg,.png"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          id="caces-file"
          onChange={handleFileChange}
          type="file"
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{t("caces.uploadDocument")}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {t("caces.uploadDocumentDescription")}
            </p>
          </div>
          <Button className="mt-1" size="sm" type="button" variant="outline">
            {t("caces.selectFile")}
          </Button>
        </div>
      </div>
    </div>
  );
}
