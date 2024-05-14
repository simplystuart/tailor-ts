import(env.FUNCTIONS_URL).then((module) => {
  self.onmessage = ({ data }) => {
    const { job } = data;
    const fn = module.functions[job.fn];
    const result = fn.apply(null, job.args);
    self.postMessage({ id: job.id, result });
  };
  self.onmessageerror = (error: MessageEvent) =>
    console.error({ error, thread: self.name });
}).catch((_err: Error) => console.error(`Failed to load '${env.FUNCTIONS_URL}`));
