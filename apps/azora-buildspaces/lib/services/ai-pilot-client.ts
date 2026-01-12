// Minimal azoraPilotClient stub used for background ingestion
export const azoraPilotClient = {
  async ingest(content: string, path?: string) {
    // noop in tests; real implementation should send content to the Knowledge Ocean
    return true
  }
}
