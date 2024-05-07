import * as Queue from "./queue.js";
import * as ChildThread from "./child-thread.js";

class ParentThread implements ThreadInterface {
  private queue: Queue.Queue<Job> = new Queue.Queue();
  private resolvers: Map<number, Resolver<Job>>;
  private threads: ThreadInterface[] = [];

  constructor(public id: number, private options: SchedulerOptions) {
    this.resolvers = new Map<number, Resolver<Job>>();
  }

  runJob(enqueuedJob: Job): Promise<Job> {
    const { id } = enqueuedJob;
    const status = enqueuedJob.status.kind;

    if (status !== "enqueued")
      Promise.reject(`Job '${id}' is '${status}' and not enqueued`);

    const job = {
      ...enqueuedJob, status: { kind: "running", threadId: this.id }
    };

    return import(this.options.functionsUrl)
      .then((module) => module.functions[job.fn].apply(null, job.args))
      .then((value) =>
        ({ ...job, status: { kind: "completed", value } })) as Promise<Job>;
  }

  scheduleJob(job: Job): Promise<Job> {
    const result = new Promise((resolve) => {
      this.resolvers.set(job.id, resolve);
    }) as Promise<Job>;

    this.queue.insert({ ...job, status: { kind: "enqueued" } });

    if (this.queue.length === 1) this.processQueue();

    return result;
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      for (let i = 0; i < this.options.maxThreads; ++i) {
        if (this.queue.length === 0) break;
        if (i < this.threads.length) continue;

        const job = this.queue.remove();

        if (i === 0) {
          this.threads.push(this);
        } else {
          this.threads.push(
            new ChildThread.ChildThread(i + 1, this.options.functionsUrl)
          );
        }

        this.threads[i].runJob(job).then((job: Job) => {
          const resolver = this.resolvers.get(job.id);

          if (resolver) {
            this.resolvers.delete(job.id);
            resolver(job);
          } else {
            throw new Error(`Job '${job.id}' not found`);
          }

          this.threads.slice(i, 1);
        });
      }
    }
  }
}

export { ParentThread };
