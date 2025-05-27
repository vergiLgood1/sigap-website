export interface IInstrumentationService {
  startSpan<T>(
    options: { name: string; op?: string; attributes?: Record<string, any> },
    callback: () => T
  ): T;
  instrumentServerAction<T>(
    name: string,
    options: Record<string, any>,
    callback: () => T
  ): Promise<T>;
}

class InstrumentationService implements IInstrumentationService {
  startSpan<T>(
    spanAttributes: { name: string; op: string; attributes: Record<string, string> },
    callback: () => T
  ): T {
    // Your implementation here
    console.log(`Starting span: ${spanAttributes.name}`);
    try {
      return callback();
    } finally {
      console.log(`Ending span: ${spanAttributes.name}`);
    }
  }

  async instrumentServerAction<T>(
    name: string,
    options: Record<string, any>,
    callback: () => T
  ): Promise<T> {
    // Implementation of the instrumentServerAction method
    return callback();
  }
}

export const IInstrumentationServiceImpl = new InstrumentationService();