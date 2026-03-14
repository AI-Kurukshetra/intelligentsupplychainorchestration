"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExceptionDetail, useExceptionComments, useCreateExceptionComment, useUpdateException } from "@/hooks/use-exceptions";
import { exceptionCommentSchema, exceptionUpdateSchema, type ExceptionCommentInput, type ExceptionUpdateInput } from "@/types/schemas";
import { getErrorMessage, cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RefreshButton } from "@/components/shared/refresh-button";
import { PageHero } from "@/components/shared/page-hero";

function severityBadge(severity: string) {
  const map: Record<
    string,
    { label: string; className: string; variant?: "secondary" | "outline" | "destructive" }
  > = {
    critical: { label: "Critical", variant: "destructive", className: "uppercase" },
    high: {
      label: "High",
      variant: "secondary",
      className: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-50",
    },
    medium: { label: "Medium", variant: "outline", className: "border-border/70 text-foreground" },
    low: {
      label: "Low",
      variant: "outline",
      className: "border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-50",
    },
  };
  const tone = map[severity] ?? map.low;
  if (!tone) return null;
  return (
    <Badge variant={tone.variant ?? "outline"} className={`px-2 text-[11px] ${tone.className}`}>
      {tone.label}
    </Badge>
  );
}

function statusBadge(status: string) {
  const tone: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-destructive/10 text-destructive border-destructive/30" },
    in_review: { label: "In review", className: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-50" },
    resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-50" },
    escalated: { label: "Escalated", className: "bg-primary/10 text-primary border-primary/30" },
  };
  const item = tone[status] ?? tone.open;
  if (!item) return null;
  return (
    <Badge variant="outline" className={`px-2 text-[11px] ${item.className}`}>
      {item.label}
    </Badge>
  );
}

export default function ExceptionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const statusOptions = ["open", "in_review", "resolved", "escalated"];
  const severityOptions = ["critical", "high", "medium", "low"];
  const { data, isLoading, isError, error, refetch, isFetching } = useExceptionDetail(id);
  const { data: comments, isLoading: commentsLoading } = useExceptionComments(id);
  const update = useUpdateException(id);
  const addComment = useCreateExceptionComment(id);

  const statusForm = useForm<ExceptionUpdateInput>({
    resolver: zodResolver(exceptionUpdateSchema),
    defaultValues: { status: "in_review" },
  });

  const commentForm = useForm<ExceptionCommentInput>({
    resolver: zodResolver(exceptionCommentSchema),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    if (data) {
      statusForm.reset({
        status: data.status as ExceptionUpdateInput["status"],
        severity: data.severity as ExceptionUpdateInput["severity"],
        assigned_to: data.assigned_to ?? "",
      });
    }
  }, [data, statusForm]);

  const statusValue = useWatch({ control: statusForm.control, name: "status" }) ?? "open";
  const severityValue = useWatch({ control: statusForm.control, name: "severity" }) ?? "medium";

  const createdDisplay = useMemo(
    () => (data?.created_at ? new Date(data.created_at).toLocaleString() : "—"),
    [data]
  );
  const resolvedDisplay = useMemo(
    () => (data?.resolved_at ? new Date(data.resolved_at).toLocaleString() : "—"),
    [data]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load exception.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title={data.title}
        description={data.description ?? "No description provided."}
        pill={{ label: "Exception detail" }}
        badges={[
          `Severity: ${data.severity}`,
          `Status: ${data.status}`,
          `Type: ${data.type}`,
        ]}
        actions={
          <>
            <RefreshButton
              onClick={() => void refetch()}
              loading={isFetching}
              tooltip="Reload exception"
              buttonProps={{ className: "border-primary/30 bg-primary/5 text-primary" }}
            />
            <Link
              href="/exceptions"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to queue
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Context</CardTitle>
          <CardDescription>Relationships, status, and timestamps.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Severity</p>
            <div className="mt-1">{severityBadge(data.severity)}</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">{statusBadge(data.status)}</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="mt-1 font-medium">{data.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Related product</p>
            <p className="mt-1 font-medium">{data.related_product_id ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Related facility</p>
            <p className="mt-1 font-medium">{data.related_facility_id ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned to</p>
            <p className="mt-1 font-medium">{data.assigned_to ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created at</p>
            <p className="mt-1 font-medium">{createdDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resolved at</p>
            <p className="mt-1 font-medium">{resolvedDisplay}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Update status</CardTitle>
            <CardDescription>Adjust lifecycle, severity, and assignee.</CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px]">RLS enforced</Badge>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={statusForm.handleSubmit(async (values) => {
              await update.mutateAsync(values);
            })}
            className="grid gap-3 md:grid-cols-3 md:items-end"
          >
            <SelectField
              label="Status"
              value={statusValue}
              onChange={(v) =>
                statusForm.setValue("status", (v ?? "open") as ExceptionUpdateInput["status"])
              }
              options={statusOptions}
            />
            <SelectField
              label="Severity"
              value={severityValue}
              onChange={(v) =>
                statusForm.setValue(
                  "severity",
                  (v ?? "medium") as ExceptionUpdateInput["severity"]
                )
              }
              options={severityOptions}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Assign to (user id)</label>
              <Input {...statusForm.register("assigned_to")} placeholder="uuid or blank" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" loading={update.isPending} loadingText="Saving...">
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => statusForm.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commentsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.author_id}</TableCell>
                    <TableCell>{c.content}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {!comments?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No comments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <form
            onSubmit={commentForm.handleSubmit(async (values) => {
              await addComment.mutateAsync(values);
              commentForm.reset({ content: "" });
            })}
            className="flex flex-col gap-3 md:flex-row md:items-end"
          >
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Add comment</label>
              <Input {...commentForm.register("content")} placeholder="Write a comment" />
            </div>
            <Button type="submit" loading={addComment.isPending} loadingText="Posting...">
              Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string | null) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
