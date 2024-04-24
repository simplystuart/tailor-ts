import * as Functions from "./functions.js"; // TODO: dynamic import
import * as Queue from "./queue.js";
import * as ChildThread from "./child-thread.js";

class ParentThread implements ThreadInterface {
  private queue: Queue.Queue<Job> = new Queue.Queue();
  private resolvers: Map<number, Resolver<Job>>;
  private threads: ThreadInterface[] = [];

  constructor(public id: number, public maxThreads: number = 1) {
    this.resolvers = new Map<number, Resolver<Job>>();
  }

  runJob(enqueuedJob: Job): Promise<Job> {
    const job = {
      ...enqueuedJob, status: { kind: "running", threadId: this.id }
    };

    const result = new Promise((resolve) => {
      const value = Functions.functions[job.fn].apply(null, job.args);
      resolve({ ...job, status: { kind: "completed", value } });
    }) as Promise<Job>;

    return result;
  }

  scheduleJob(job: Job): Promise<Job> {
    const result = new Promise((resolve) => {
      this.resolvers.set(job.id, resolve);
    }) as Promise<Job>;

    this.queue.insert(job);

    if (this.queue.length === 1) this.processQueue();

    return result;
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      for (let i = 0; i < this.maxThreads; ++i) {
        if (this.queue.length === 0) break;
        if (i < this.threads.length) continue;

        const job = this.queue.remove();

        if (i === 0) {
          this.threads.push(this);
        } else {
          this.threads.push(new ChildThread.ChildThread(i + 1));
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
