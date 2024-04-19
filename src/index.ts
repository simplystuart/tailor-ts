class PriorityQueue<T extends { priority: number }> {
  public length: number = 0;
  private data: T[] = [];

  constructor() { }

  insert(value: T): void {
    this.data[this.length] = value;
    this.siftUp(this.length);
    this.length++;
  }

  remove(): T {
    if (this.length === 0) throw new Error("Queue is empty")

    const item = this.data[0];
    this.length--;

    this.data[0] = this.data[this.length];
    this.siftDown(0);

    return item;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private siftDown(index: number): void {
    let [left, right] = [this.leftChild(index), this.rightChild(index)];
    let minChild = this.data[right].priority ? Math.min(this.data[left].priority, this.data[right].priority) : this.data[left].priority || Infinity;

    while (index < this.length && this.data[index].priority > minChild) {
      let swapIndex = this.data[left].priority > this.data[right].priority ? right : left;
      [this.data[index], this.data[swapIndex]] = [this.data[swapIndex], this.data[index]];
      index = swapIndex;
      [left, right] = [this.leftChild(index), this.rightChild(index)];
      minChild = this.data[right].priority ? Math.min(this.data[left].priority, this.data[right].priority) : this.data[left].priority || Infinity;
    }
  }

  private siftUp(index: number): void {
    let parent = this.parent(index);

    while (index > 0 && this.data[parent].priority < this.data[index].priority) {
      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];
      index = parent;
      parent = this.parent(index);
    }
  }
}

type Resolver<T> = (value: T | PromiseLike<T>) => void;

class Thread {
  public running: boolean = false;

  private name: string;
  private worker: Worker;

  private job?: Job;
  private resolver?: Resolver<Job>;

  constructor(private id: number) {
    this.name = `thread-${this.id}`;

    const workerUrl = URL.createObjectURL(
      new Blob([this.workerJs()], { type: "application/javascript" })
    );

    this.worker = new Worker(workerUrl, { name: this.name, type: "module" });

    this.worker.onmessage = ({ data }) =>
      this.endJob({ kind: "completed", value: data.result });

    this.worker.onerror = (_event) =>
      this.endJob({ kind: "failed", error: "Worker error" });

    this.worker.onmessageerror = (_event) =>
      this.endJob({ kind: "failed", error: "Message error" });
  }

  runJob(job: Job): { id: number, result: Promise<Job> } {
    this.job = { ...job, status: { kind: "running", threadId: this.id } };
    this.running = true;

    const result = new Promise((resolve) => {
      this.resolver = resolve;
    }) as Promise<Job>;

    this.worker.postMessage({ job: this.job });

    return { id: this.job.id, result };
  }

  private endJob(status: JobStatus): void {
    this.running = false;

    if (this.job && this.resolver) {
      this.job.status = status;
      this.resolver(this.job);
    } else {
      throw new Error("Job resolver not found");
    }
  }

  private workerJs(): string {
    // TODO: dynamic import
    return `
      import * as Functions from "./functions.js";
      self.onmessage = ({ data }) => {
          const { job } = data;
          const fn = Functions.functions[job.fn];
          const result = fn.apply(null, job.args);
          self.postMessage({ result });
      };
      self.onmessageerror = (error) => console.error({ error, thread: self.name });
    `;
  }
}

class ThreadedJob {
  private jobId: number = 0;
  private processing: boolean = false;
  private queue: PriorityQueue<Job> = new PriorityQueue();
  private threads: Thread[] = [];

  constructor(private maxThreads: number = 1) {
    for (let id = 1; id <= this.maxThreads; ++id) {
      this.threads.push(new Thread(id));
    }
  }

  add(fn: string, { args = [], priority = 0 }: JobOptions): Job {
    this.jobId++;

    const status = { kind: "enqueued" } as EnqueuedStatus;

    const job = { id: this.jobId, fn, args, priority, status };

    this.queue.insert(job);

    if (!this.processing) this.processJobs();

    return job;
  }

  private async processJobs() {
    this.processing = true;

    while (this.queue.length > 0) {
      for (const thread of this.threads) {
        if (this.queue.length === 0) break;
        if (thread.running) continue;

        const job = this.queue.remove();

        if (job.status.kind === "enqueued") {
          thread.runJob(job);
        } else {
          throw new Error(`Job '${job.id}' status is not enqueued`);
        }
      }
    }

    this.processing = false;
  }
}

export { ThreadedJob };
