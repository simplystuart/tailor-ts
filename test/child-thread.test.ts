import * as ChildThread from '../src/child-thread';
import * as Worker from "./worker";

describe("ChildThread", function() {
  global.URL.createObjectURL = jest.fn();
  global.Worker = Worker.Worker;

  const childThread = new ChildThread.ChildThread(1, "/functions.js");

  it("should create a child thread", function() {
    expect(childThread.id).toBe(1);
  });

  it("should run an enqueued job", async function() {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "enqueued" }
    } as Job;

    expect(childThread.runJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed", value: 3 }
    });
  });

  it("should fail to run a non-enqueued job", async function() {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "running", threadId: 1 }
    } as Job;

    expect(childThread.runJob(job)).rejects.toEqual(
      "Job '1' is 'running' and not enqueued"
    );
  });
});
