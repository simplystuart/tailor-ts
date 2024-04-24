class ChildThread implements ThreadInterface {
  private worker: Worker;

  private current?: { job: Job, resolver: Resolver<Job> };

  constructor(public id: number) {
    const workerUrl = URL.createObjectURL(
      new Blob([this.workerJs()], { type: "application/javascript" })
    );

    this.worker = new Worker(workerUrl, {
      name: `thread-${this.id}`, type: "module"
    });

    this.worker.onmessage = ({ data }) =>
      this.finishJob({ kind: "completed", value: data.result });

    this.worker.onerror = (_event) => {
      if (this.current) {
        this.finishJob({ kind: "failed", error: "Worker error" });
      } else {
        throw new Error("Worker error");
      }
    }

    this.worker.onmessageerror = (_event) => {
      if (this.current) {
        this.finishJob({ kind: "failed", error: "Worker message error" });
      } else {
        throw new Error("Worker message error");
      }
    }
  }

  runJob(enqueuedJob: Job): Promise<Job> {
    const job = {
      ...enqueuedJob,
      status: { kind: "running", threadId: this.id } as RunningStatus
    };

    const result = new Promise((resolve) => {
      this.current = { job, resolver: resolve };
    }) as Promise<Job>;

    this.worker.postMessage({ job });

    return result;
  }

  private finishJob(status: JobStatus): void {
    if (this.current) {
      this.current.resolver({ ...this.current.job, status });
    } else {
      throw new Error("Job not found");
    }

    this.current = undefined;
    this.worker.terminate();
  }

  private workerJs(): string {
    // TODO: dynamic import
    return `
      import * as Functions from "./functions.js";
      self.onmessage = ({ data }) => {
        const { job } = data;
        const fn = Functions.functions[job.fn];
        const result = fn.apply(null, job.args);
        self.postMessage({ id: job.id, result });
      };
      self.onmessageerror = (error) =>
        console.error({ error, thread: self.name });
    `;
  }
}

export { ChildThread };
