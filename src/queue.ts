class Queue<T extends { priority: number }> {
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

    let minChild = this.data[right]
      ? Math.min(this.data[left].priority, this.data[right].priority)
      : this.data[left] ? this.data[left].priority : Infinity;

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

export { Queue };
