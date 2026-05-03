import { useState } from "react";
import { useGetRevisionQueue, useCompleteRevision, useAddToRevisionQueue } from "@workspace/api-client-react";
import { getGetRevisionQueueQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarClock, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Due now";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

export default function Revision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("due");

  const { data: allItems, isLoading } = useGetRevisionQueue();
  const completeRevision = useCompleteRevision({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRevisionQueueQueryKey() });
        toast({ title: "Revision marked complete" });
      },
    },
  });

  const now = new Date();
  const dueItems = allItems?.filter((i) => new Date(i.nextReviewAt) <= now) ?? [];
  const upcomingItems = allItems?.filter((i) => new Date(i.nextReviewAt) > now) ?? [];

  function handleComplete(id: number, passed: boolean) {
    completeRevision.mutate({ id, data: { passed } });
  }

  function renderItems(items: typeof allItems) {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      );
    }
    if (!items?.length) {
      return (
        <Card>
          <CardContent className="text-center py-14 text-muted-foreground">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nothing here yet</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const isDue = new Date(item.nextReviewAt) <= now;
          return (
            <Card key={item.id} data-testid={`revision-item-${item.id}`}>
              <CardContent className="flex items-start justify-between gap-4 pt-4 pb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{item.topic}</p>
                    <Badge variant="outline" className="text-xs">{item.examType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.subject}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={item.score < 50 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      Score: {item.score}%
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.nextReviewAt)}
                    </span>
                  </div>
                </div>
                {isDue && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleComplete(item.id, false)}
                      disabled={completeRevision.isPending}
                      data-testid={`btn-fail-${item.id}`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Missed
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handleComplete(item.id, true)}
                      disabled={completeRevision.isPending}
                      data-testid={`btn-pass-${item.id}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Got it
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto" data-testid="page-revision">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-primary" />
            Revision Queue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Spaced repetition schedule — review at the right time to lock in memory
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5">
            <TabsTrigger value="due" data-testid="tab-due">
              Due ({dueItems.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingItems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="due">{renderItems(dueItems)}</TabsContent>
          <TabsContent value="upcoming">{renderItems(upcomingItems)}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
