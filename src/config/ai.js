module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  modelName: process.env.AI_MODEL_NAME || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
  defaultConfidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.75')
};
