"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SemanticSearchClient() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ content: string; score: number; documentTitle: string }[]>(
    [],
  );
  const [mode, setMode] = useState<string>("");

  async function search() {
    if (q.length < 2) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, topK: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.results ?? []);
      setMode(data.mode ?? "");
      toast.success("Search complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-5" />
          Semantic search
        </CardTitle>
        <CardDescription>
          Hybrid embeddings + lexical fallback until all materials carry vectors. Ingest PDFs via
          documents to populate chunks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="q">Query</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Ask across readings, slides, and handouts…"
            />
            <Button type="button" disabled={loading || q.length < 2} onClick={search}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
          </div>
          {mode ? (
            <p className="mt-2 text-xs text-muted-foreground">Mode: {mode}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          {results.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">Results appear here with source titles.</p>
          ) : null}
          {results.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-muted/10 p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.documentTitle}</span>
                <span>score {(r.score as number).toFixed(3)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
