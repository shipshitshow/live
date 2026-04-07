import type { PipelineJob } from "@/lib/pipeline-types";

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();

export const MOCK_JOBS: PipelineJob[] = [
  {
    id: "demo-job-001",
    episode_id: "EP-001",
    title: "We Built a YouTube Channel Run by AI Agents — And It Runs Itself",
    topic: "AI agents autonomously managing a YouTube channel end-to-end",
    status: "ready_for_review",
    created_at: hoursAgo(12),
    updated_at: hoursAgo(1),
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    stages: [
      {
        name: "script",
        label: "Script Generation",
        status: "done",
        started_at: hoursAgo(12),
        completed_at: hoursAgo(11),
        output: { word_count: 1840, sections: 6, tone: "conversational" },
      },
      {
        name: "audio",
        label: "Audio Pipeline (TTS + Processing)",
        status: "done",
        started_at: hoursAgo(11),
        completed_at: hoursAgo(9),
        output: { duration_sec: 612, format: "wav", voice: "alloy" },
      },
      {
        name: "video",
        label: "Video Assembly",
        status: "done",
        started_at: hoursAgo(9),
        completed_at: hoursAgo(4),
        output: { resolution: "1920x1080", fps: 30, codec: "h264" },
      },
      {
        name: "thumbnail",
        label: "Thumbnail Generation",
        status: "done",
        started_at: hoursAgo(4),
        completed_at: hoursAgo(3),
        output: { resolution: "1280x720", format: "png" },
      },
      {
        name: "upload",
        label: "YouTube Upload",
        status: "pending",
      },
    ],
  },
  {
    id: "demo-job-002",
    episode_id: "EP-002",
    title: "How We Automated Video Editing with AI — No Human Touched the Timeline",
    topic: "Automated video editing pipeline using AI for cuts, B-roll, and transitions",
    status: "ready_for_review",
    created_at: hoursAgo(6),
    updated_at: hoursAgo(2),
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    rejection_reason: "Audio levels too low in intro section (0:00-0:45). Narration barely audible over background music.",
    stages: [
      {
        name: "script",
        label: "Script Generation",
        status: "done",
        started_at: hoursAgo(6),
        completed_at: hoursAgo(5),
        output: { word_count: 2100, sections: 8, tone: "technical" },
      },
      {
        name: "audio",
        label: "Audio Pipeline (TTS + Processing)",
        status: "done",
        started_at: hoursAgo(5),
        completed_at: hoursAgo(4),
        output: { duration_sec: 780, format: "wav", voice: "nova" },
      },
      {
        name: "video",
        label: "Video Assembly",
        status: "done",
        started_at: hoursAgo(4),
        completed_at: hoursAgo(3),
        output: { resolution: "1920x1080", fps: 30, codec: "h264" },
      },
      {
        name: "thumbnail",
        label: "Thumbnail Generation",
        status: "done",
        started_at: hoursAgo(3),
        completed_at: hoursAgo(2),
        output: { resolution: "1280x720", format: "png" },
      },
      {
        name: "upload",
        label: "YouTube Upload",
        status: "pending",
      },
    ],
  },
];

export function getMockJob(jobId: string): PipelineJob | undefined {
  return MOCK_JOBS.find((j) => j.id === jobId);
}

export function reviewMockJob(jobId: string, action: "approve" | "reject", reason?: string): PipelineJob | undefined {
  const job = getMockJob(jobId);
  if (!job) return undefined;
  return {
    ...job,
    status: action === "approve" ? "approved" : "rejected",
    rejection_reason: action === "reject" ? reason : job.rejection_reason,
    updated_at: new Date().toISOString(),
  };
}
