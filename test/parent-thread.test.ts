import * as ParentThread from '../src/parent-thread';
import * as Worker from "./worker";

describe("ParentThread", function() {
  global.URL.createObjectURL = jest.fn();
  global.Worker = Worker.Worker;

  const parentThread = new ParentThread.ParentThread(1, {
    functionsUrl: "/functions.js", maxThreads: 1
  });

  it("should create a parent thread", function() {
    expect(parentThread.id).toBe(1);
  });

  it("should run an enqueued job", async function() {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "enqueued" }
    } as Job;

    expect(parentThread.runJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed", value: 3 }
    });
  });

  it("should fail to run a non-enqueued job", async function() {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "running", threadId: 1 }
    } as Job;

    expect(parentThread.runJob(job)).rejects.toEqual(
      "Job '1' is 'running' and not enqueued"
    );
  });

  it("should schedule and run a job", async function() {
    const job = { id: 1, fn: "add", args: [1, 2] } as Job;

    expect(parentThread.scheduleJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed", value: 3 }
    });
  });
});
