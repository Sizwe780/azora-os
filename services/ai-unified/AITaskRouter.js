export class AITaskRouter {
  constructor(registry) {
    this.registry = registry;
    this.taskMappings = {
      'text-generation': ['quantum-deep-mind', 'gpt-4', 'claude-3-opus', 'llama-2-70b'],
      'analysis': ['quantum-deep-mind', 'gpt-4', 'claude-3-sonnet', 'mistral-7b'],
      'code': ['gpt-4', 'claude-3-opus', 'mistral-7b'],
      'creative': ['claude-3-opus', 'gpt-4', 'quantum-deep-mind'],
      'prediction': ['quantum-deep-mind', 'gpt-3.5-turbo'],
      'chat': ['gpt-3.5-turbo', 'claude-3-sonnet', 'quantum-deep-mind'],
      'compliance': ['quantum-deep-mind', 'gpt-4', 'claude-3-sonnet'],
      'translation': ['claude-3-opus', 'gpt-4', 'mistral-7b'],
      'summarization': ['quantum-deep-mind', 'gpt-3.5-turbo', 'claude-3-sonnet']
    };
  }

  routeTask(task, content, options = {}) {
    const { model, maxCost, preferredLatency } = options;

    let selectedModel;

    if (model && this.registry.getModel(model)) {
      selectedModel = this.registry.getModel(model);
    } else {
      selectedModel = this.registry.getBestModelForTask(task, { maxCost, preferredLatency });
    }

    if (!selectedModel) {
      throw new Error(`No suitable model found for task: ${task}`);
    }

    return {
      modelId: selectedModel.id || model,
      model: selectedModel,
      task,
      content,
      options
    };
  }
}