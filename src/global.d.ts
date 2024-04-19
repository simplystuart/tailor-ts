declare type Primitive = boolean | number | string;

declare type JobOptions = {
  args?: Primitive[];
  priority?: number;
}

declare type Job = {
  id: number;
  fn: string;
  args: Primitive[];
  priority: number;
  status: JobStatus;
}

declare type JobStatus = EnqueuedStatus | RunningStatus | CompletedStatus | FailedStatus;

declare type EnqueuedStatus = {
  kind: "enqueued",
}

declare type RunningStatus = {
  kind: "running",
  threadId: number,
}

declare type CompletedStatus = {
  kind: "completed",
  value: Primitive,
}

declare type FailedStatus = {
  kind: "failed",
  error: string
}
