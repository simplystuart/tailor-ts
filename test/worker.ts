class Worker {
  // Constructor
  constructor(_url: string | URL, _options?: WorkerOptions) { }

  // Instance methods
  public postMessage(_message: any): void;
  public postMessage(_message: any, _options?: Transferable | { transfer: Transferable[] }): void { };
  public terminate(): void { }

  // Events
  public onerror(_event: Event): void { }
  public onmessage(_msg: MessageEvent): void { }
  public onmessageerror(_event: MessageEvent): void { }

  // Inherited instance methods
  public addEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions) { }
  public removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions) { }
  public dispatchEvent(_event: Event): boolean { return true; }
}

export { Worker };
