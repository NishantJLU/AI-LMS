"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AiStudioClient() {
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("Neural networks: backpropagation");
  const [difficulty, setDifficulty] = useState<"intro" | "intermediate" | "advanced">(
    "intermediate",
  );
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [out, setOut] = useState<string>("");

  async function run(path: string, body: object) {
    setLoading(path);
    setOut("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      setOut(JSON.stringify(data, null, 2));
      toast.success("Done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Tabs defaultValue="summarize" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="summarize">Summarize</TabsTrigger>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
        <TabsTrigger value="cards">Flashcards</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="summarize">
        <Card>
          <CardHeader>
            <CardTitle>Notes summarizer</CardTitle>
            <CardDescription>Paste lecture notes or reading text (PDF extract works here).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                className="mt-1.5 min-h-40"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste text…"
              />
            </div>
            <Button
              disabled={loading !== null || notes.length < 20}
              onClick={() => run("/api/ai/summarize", { text: notes })}
            >
              {loading === "/api/ai/summarize" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Generate summary & key concepts
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quiz">
        <Card>
          <CardHeader>
            <CardTitle>Quiz generator</CardTitle>
            <CardDescription>MCQs with difficulty control — classroom-ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Textarea
                className="mt-1.5"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as typeof difficulty)}
              >
                <SelectTrigger className="mt-1.5 w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro">Intro</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={loading !== null}
              onClick={() =>
                run("/api/ai/quiz", {
                  topic,
                  difficulty,
                  count: 8,
                })
              }
            >
              {loading === "/api/ai/quiz" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Generate quiz
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cards">
        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Stored as a set you can revisit from the database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-40"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste notes to convert to cards…"
            />
            <Button
              disabled={loading !== null || notes.length < 20}
              onClick={() =>
                run("/api/ai/flashcards", { text: notes, title: "AI-generated deck" })
              }
            >
              {loading === "/api/ai/flashcards" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Generate deck
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback">
        <Card>
          <CardHeader>
            <CardTitle>Assignment feedback assistant</CardTitle>
            <CardDescription>
              Rubric-aware suggestions — instructors still own the grade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-48"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Paste a draft submission…"
            />
            <Button
              disabled={loading !== null || submission.length < 20}
              onClick={() =>
                run("/api/ai/feedback", {
                  submissionText: submission,
                  assignmentTitle: "Open response",
                })
              }
            >
              {loading === "/api/ai/feedback" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Analyze draft
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {out ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg bg-muted/40 p-4 text-xs">{out}</pre>
          </CardContent>
        </Card>
      ) : null}
    </Tabs>
  );
}
