import { CreateCourseForm } from "@/components/courses/create-course-form";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New subject</h1>
        <p className="text-muted-foreground">
          You can attach modules, uploads, quizzes, and AI-generated assessments after creation.
        </p>
      </div>
      <CreateCourseForm />
    </div>
  );
}
