export type Config = {
  functionsUrl?: string | URL;
  maxThreads?: number;
}

class Tailor {
  private jobId: number = 0;
  private jobResolvers: Map<number, Resolver<Job>>;
  private options: SchedulerOptions;

  private scheduler?: Worker;

  constructor(config?: Config) {
    // TODO: url error checking... must be absolute
    const functionsUrl: string =
      config?.functionsUrl && config?.functionsUrl instanceof URL
        ? config?.functionsUrl?.toString()
        : config?.functionsUrl
          ? config?.functionsUrl as string : "./functions";

    this.jobResolvers = new Map<number, Resolver<Job>>();
    this.options = { functionsUrl, maxThreads: config?.maxThreads || 1 };
  }

  schedule(
    fn: string, { args = [], priority = 0 }: JobOptions
  ): { id: number, result: Promise<Job> } {
    this.jobId++;

    const result = new Promise((resolve) => {
      this.jobResolvers.set(this.jobId, resolve);
    }) as Promise<Job>;

    if (!this.scheduler) this.setupScheduler();

    this.scheduler?.postMessage({
      job: { id: this.jobId, fn, args, priority, status: { kind: "enqueued" } },
      options: this.options,
    });

    return { id: this.jobId, result };
  }

  private setupScheduler(): void {
    this.scheduler = new Worker("./scheduler", {
      name: "scheduler", type: "module"
    });

    this.scheduler.onmessage = ({ data }) => {
      const jobResolver = this.jobResolvers.get(data.job.id);

      if (jobResolver) {
        this.jobResolvers.delete(data.job.id);
        if (this.jobResolvers.size === 0) this.teardownScheduler();
        jobResolver(data.job);
      } else {
        throw new Error(`Job '${data.job.id}' not found`);
      }
    }

    this.scheduler.onerror = (_event) =>
      console.error("Scheduler error");

    this.scheduler.onmessageerror = (_event) =>
      console.error("Scheduler message error");
  }

  private teardownScheduler(): void {
    this.scheduler?.terminate();
    this.scheduler = undefined;
  }
}

export { Tailor };
