class Tailor {
  private jobId: number = 0;
  private jobResolvers: Map<number, Resolver<Job>>;

  private scheduler?: Worker;

  constructor(private maxThreads: number = 1) {
    this.jobResolvers = new Map<number, Resolver<Job>>();
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
      maxThreads: this.maxThreads
    });

    return { id: this.jobId, result };
  }

  private setupScheduler(): void {
    this.scheduler = new Worker("dist/scheduler.js", {
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
