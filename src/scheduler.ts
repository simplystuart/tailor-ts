import * as ParentThread from "./parent-thread.js";

let scheduler: ParentThread.ParentThread | undefined;

self.onmessage = ({ data }) => {
  if (!scheduler) scheduler = new ParentThread.ParentThread(1, data.options);
  scheduler.scheduleJob(data.job).then((job) => self.postMessage({ job }));
};

self.onmessageerror = (error) => console.error({ error, thread: "scheduler" });
