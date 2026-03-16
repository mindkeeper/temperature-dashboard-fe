import { LoginForm } from "@/modules/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — brand panel */}
      <div className="bg-primary relative flex-col justify-between overflow-hidden p-10 lg:flex lg:w-2/5">
        <div className="z-10">
          <img src="/brand-logo.svg" alt="ADW" className="h-16 w-auto" />
        </div>
        <div className="relative z-10 mt-20 mb-12 lg:mt-auto">
          <blockquote className="max-w-lg space-y-4">
            <p className="text-2xl leading-relaxed font-medium text-white/95">
              &ldquo;Do more, step up your capabilities, get more.&rdquo;
            </p>
            <footer className="text-sm font-medium text-white/80">Sonny Sumarsono, PMP</footer>
          </blockquote>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-primary text-5xl font-bold">Sign In</h1>
            <p className="text-muted-foreground text-sm">Please enter your details to sign in</p>
          </div>

          <LoginForm />

          <p className="text-muted-foreground text-center text-xs">
            &copy; 2026 The Magnum Ice Cream Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
