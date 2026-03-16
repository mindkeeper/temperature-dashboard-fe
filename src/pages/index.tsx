import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">React Boilerplate</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          A production-ready starter with Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query,
          Zustand, and MSW — all wired up and ready to go.
        </p>
      </div>
      <Button
        size="lg"
        onClick={() => {
          void navigate("/dashboard");
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
