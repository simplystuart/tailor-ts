import * as Threaded from "./dist/threaded.js";

const backgroundJob = new Threaded.BackgroundJob();

const { id, result } = backgroundJob.enqueue("add", [5, 5]);

console.log({ id, result });

result.then(console.log);
