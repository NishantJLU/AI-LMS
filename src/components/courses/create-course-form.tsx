"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createCourse } from "@/server/actions/course";

export function CreateCourseForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await createCourse({ title, code, description, published });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Subject created");
      router.push(`/teacher/courses/${res.slug}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border/60 bg-card/40 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Human-centered interfaces"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Catalog code</Label>
        <Input
          id="code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="DES 401"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Publish</p>
          <p className="text-xs text-muted-foreground">Visible to enrolled learners.</p>
        </div>
        <Switch checked={published} onCheckedChange={setPublished} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create subject"}
      </Button>
    </form>
  );
}
