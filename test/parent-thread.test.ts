import * as ParentThread from '../src/parent-thread';
import * as Worker from "./worker";

describe("ParentThread", () => {
  global.URL.createObjectURL = jest.fn();
  global.Worker = Worker.Worker;

  const parentThread = new ParentThread.ParentThread(1, {
    functionsUrl: "./functions", maxThreads: 1
  });

  it("should create a parent thread", () =>
    expect(parentThread.id).toBe(1)
  );

  it("should run an enqueued job", () => {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "enqueued" }
    } as Job;

    return expect(parentThread.runJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed", value: 3 }
    });
  });

  it("should fail to run a non-enqueued job", () => {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "running", threadId: 1 }
    } as Job;

    return expect(parentThread.runJob(job)).rejects.toMatch(
      "Job '1' is 'running' and not enqueued"
    );
  });

  it("should schedule and run a job", () => {
    const job = { id: 1, fn: "add", args: [1, 2] } as Job;

    return expect(parentThread.scheduleJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed", value: 3 }
    });
  });
});
