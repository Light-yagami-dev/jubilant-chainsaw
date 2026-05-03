import { useState, useRef } from "react";
import { useUploadPdf } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXAM_TYPES = ["NEET", "JEE"];

export default function UploadPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [examType, setExamType] = useState("NEET");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ topicsExtracted: number; chunks: number } | null>(null);

  const uploadPdf = useUploadPdf({
    mutation: {
      onSuccess: (data) => {
        setResult({ topicsExtracted: data.topicsExtracted, chunks: data.chunks });
        toast({ title: "PDF processed successfully!" });
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: () => {
        toast({ title: "Upload failed", description: "Check the file format and try again.", variant: "destructive" });
      },
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResult(null);
    } else if (f) {
      toast({ title: "Please select a PDF file", variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    uploadPdf.mutate({ data: { file, examType } });
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto" data-testid="page-upload">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            Upload Syllabus PDF
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ingest NCERT textbooks or study materials — the tutor learns your syllabus
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">PDF Ingestion</CardTitle>
            <CardDescription>
              Upload a PDF and select the target exam. The system will extract topics and create study chunks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium block mb-2">Target Exam</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="w-40" data-testid="select-exam-upload">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">PDF File</label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                  data-testid="drop-zone"
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  {file ? (
                    <div>
                      <p className="font-medium text-sm text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Click to select a PDF</p>
                      <p className="text-xs text-muted-foreground mt-1">NCERT textbooks, study notes, etc.</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-file"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!file || uploadPdf.isPending}
                className="w-full gap-2"
                data-testid="btn-upload-submit"
              >
                <Upload className="w-4 h-4" />
                {uploadPdf.isPending ? "Processing..." : "Ingest PDF"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-4 border-green-500/30 bg-green-500/5" data-testid="upload-result">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-sm">PDF processed successfully</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {result.topicsExtracted} topics extracted
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.chunks} chunks indexed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-5 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                For best results, upload individual chapter PDFs rather than entire textbooks.
                The system performs better with focused, topic-dense content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
