import * as Queue from "../src/queue";

describe("Queue", function() {
  const queue = new Queue.Queue<{ priority: number }>();

  it("should have a length of 0 when empty", function() {
    expect(queue.length).toBe(0);
  });

  it("should throw an error when removing from an empty queue", function() {
    expect(() => queue.remove()).toThrow("Queue is empty");
  });

  it("should keep ordered elements in order", function() {
    queue.insert({ priority: 1 });
    queue.insert({ priority: 2 });
    queue.insert({ priority: 3 });
    queue.insert({ priority: 4 });

    expect(queue.length).toBe(4);
    expect(queue.remove()).toEqual({ priority: 1 });
    expect(queue.length).toBe(3);
    expect(queue.remove()).toEqual({ priority: 2 });
    expect(queue.length).toBe(2);
    expect(queue.remove()).toEqual({ priority: 3 });
    expect(queue.length).toBe(1);
  });

  it("should keep reverse ordered elements in order", function() {
    queue.insert({ priority: 3 });
    queue.insert({ priority: 2 });
    queue.insert({ priority: 1 });

    expect(queue.length).toBe(4);
    expect(queue.remove()).toEqual({ priority: 1 });
    expect(queue.length).toBe(3);
    expect(queue.remove()).toEqual({ priority: 2 });
    expect(queue.length).toBe(2);
    expect(queue.remove()).toEqual({ priority: 3 });
    expect(queue.length).toBe(1);
    expect(queue.remove()).toEqual({ priority: 4 });
    expect(queue.length).toBe(0);
  })
});
