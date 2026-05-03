import { useGetMasteryStats, useGetRevisionQueue } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, BookOpen, AlertTriangle, CalendarClock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetMasteryStats();
  const { data: queue, isLoading: queueLoading } = useGetRevisionQueue();

  const dueItems = queue?.filter((item) => new Date(item.nextReviewAt) <= new Date()) ?? [];

  return (
    <div className="flex-1 p-8 overflow-y-auto" data-testid="page-dashboard">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your NEET/JEE preparation progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            label="Total Topics"
            value={statsLoading ? null : (stats?.totalTopics ?? 0)}
            data-testid="stat-total-topics"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            label="Mastered"
            value={statsLoading ? null : (stats?.masteredTopics ?? 0)}
            data-testid="stat-mastered-topics"
          />
          <StatCard
            icon={<Brain className="w-5 h-5 text-accent" />}
            label="Avg Score"
            value={statsLoading ? null : `${Math.round(stats?.averageScore ?? 0)}%`}
            data-testid="stat-avg-score"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
            label="Weak Topics"
            value={statsLoading ? null : (stats?.weakTopics?.length ?? 0)}
            data-testid="stat-weak-topics"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-revision-due">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                Due for Revision
              </CardTitle>
              <Link href="/revision">
                <Button variant="ghost" size="sm" className="gap-1 text-xs" data-testid="link-view-revision">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : dueItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No revisions due today. Keep up the great work!
                </p>
              ) : (
                <div className="space-y-2">
                  {dueItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      data-testid={`revision-item-${item.id}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.topic}</p>
                        <p className="text-xs text-muted-foreground">{item.subject} · {item.examType}</p>
                      </div>
                      <Badge variant={item.score < 50 ? "destructive" : "secondary"} className="text-xs">
                        {item.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-weak-topics">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Topics to Improve
              </CardTitle>
              <Link href="/tutor">
                <Button variant="ghost" size="sm" className="gap-1 text-xs" data-testid="link-start-tutor">
                  Start tutor <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : !stats?.weakTopics?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No weak topics identified yet. Start tutoring to build your map!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {stats.weakTopics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-xs" data-testid={`weak-topic-${i}`}>
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground">Ready to study?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ask the AI tutor any NEET or JEE question — with adversarial accuracy checking.
              </p>
            </div>
            <Link href="/tutor">
              <Button className="gap-2 shrink-0" data-testid="cta-start-tutor">
                <Brain className="w-4 h-4" />
                Open Tutor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  "data-testid"?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {value === null ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-xl font-bold text-foreground">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
