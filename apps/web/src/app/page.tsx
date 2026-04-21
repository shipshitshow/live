import { Button } from '@shipshitshow/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary">
          Ship Shit Show
        </h1>
        <p className="max-w-lg text-lg text-text-secondary">
          Live coding, hot takes, and shipping in public — every week.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="accent" size="lg" asChild>
          <a
            href="https://youtube.com/@shipshitshow"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on YouTube
          </a>
        </Button>
        <Button size="lg" asChild>
          <a
            href="https://x.com/shipshitdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow on X
          </a>
        </Button>
      </div>
    </main>
  );
}
