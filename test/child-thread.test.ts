import * as ChildThread from '../src/child-thread';
import * as Worker from "./worker";

describe("ChildThread", () => {
  global.URL.createObjectURL = jest.fn();
  global.Worker = Worker.Worker;

  const childThread = new ChildThread.ChildThread(1, "./functions");

  it("should create a child thread", () =>
    expect(childThread.id).toBe(1)
  );

  it("should run an enqueued job", () => {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "enqueued" }
    } as Job;

    return expect(childThread.runJob(job)).resolves.toEqual({
      ...job, status: { kind: "completed" }
    });
  });

  it("should fail to run a non-enqueued job", () => {
    const job = {
      id: 1, fn: "add", args: [1, 2], status: { kind: "running", threadId: 1 }
    } as Job;

    return expect(childThread.runJob(job)).rejects.toMatch(
      "Job '1' is 'running' and not enqueued"
    );
  });
});
