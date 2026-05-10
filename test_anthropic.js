const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

async function testModel(modelName) {
  try {
    console.log(`Testing model: '${modelName}'`);
    await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hello' }],
    });
    console.log('Success for', modelName);
  } catch (error) {
    console.log(`Error for '${modelName}':`, error.message);
  }
}

async function main() {
  await testModel("claude-4-7-opus-20260416");
  await testModel("claude-3-5-sonnet-20241022");
  await testModel("claude-fake-model-123");
  await testModel("");
  await testModel(undefined);
}

main();
