import { useState } from "react";
import { useGetMasteryMap, useUpdateMastery } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGetMasteryMapQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const EXAM_TYPES = ["all", "NEET", "JEE"];
const SUBJECTS = ["all", "Physics", "Chemistry", "Biology", "Mathematics"];

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-500/15 text-green-600 border-green-500/30";
  if (score >= 50) return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
  return "bg-red-500/15 text-red-600 border-red-500/30";
}

function ScoreIcon({ score }: { score: number }) {
  if (score >= 80) return <TrendingUp className="w-3 h-3" />;
  if (score >= 50) return <Minus className="w-3 h-3" />;
  return <TrendingDown className="w-3 h-3" />;
}

export default function Mastery() {
  const [examType, setExamType] = useState("all");
  const [subject, setSubject] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = {
    ...(examType !== "all" ? { examType } : {}),
    ...(subject !== "all" ? { subject } : {}),
  };
  const { data: entries, isLoading } = useGetMasteryMap(params);
  const updateMastery = useUpdateMastery({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMasteryMapQueryKey(params) });
        toast({ title: "Mastery updated" });
      },
    },
  });

  const grouped = (entries ?? []).reduce<Record<string, typeof entries>>((acc, entry) => {
    const key = entry.subject ?? "Other";
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(entry);
    return acc;
  }, {});

  return (
    <div className="flex-1 p-8 overflow-y-auto" data-testid="page-mastery">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="w-6 h-6 text-primary" />
              Mastery Map
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Your topic-level progress across subjects</p>
          </div>
          <div className="flex gap-2">
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-32" data-testid="select-exam-type">
                <SelectValue placeholder="Exam type" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t === "all" ? "All exams" : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-36" data-testid="select-subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All subjects" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !entries?.length ? (
          <Card>
            <CardContent className="text-center py-16 text-muted-foreground">
              <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No mastery data yet</p>
              <p className="text-sm mt-1">Complete some tutoring sessions to track your progress.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([subj, items]) => (
              <Card key={subj} data-testid={`mastery-subject-${subj}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {subj}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {items?.map((entry) => (
                      <div
                        key={entry.id}
                        data-testid={`mastery-topic-${entry.id}`}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium flex flex-col gap-1 ${scoreColor(entry.score)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{entry.score}%</span>
                          <ScoreIcon score={entry.score} />
                        </div>
                        <span className="text-[11px] leading-tight opacity-80 line-clamp-2">{entry.topic}</span>
                        <span className="text-[10px] opacity-60">{entry.attempts} attempt{entry.attempts !== 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
