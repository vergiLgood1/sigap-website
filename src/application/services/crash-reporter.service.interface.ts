export interface ICrashReporterService {
    report(error: any): string;
  }

class CrashReporterService implements ICrashReporterService {
  report(error: any): string {
    // Implementation of the report method
    return "Error reported";
  }
}

export const ICrashReporterServiceImpl = new CrashReporterService();