import { InferenceClient } from '@huggingface/inference';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const model = 'meta-llama/Llama-3.3-70B-Instruct';
const token = process.env.HF_TOKEN;
const input = readFileSync(resolve(process.cwd(), 'experiment', 'data.csv'));

const basePrompt = `Extract the following information`;

const client = new InferenceClient(token);

(async () => {
  const response = await client.chatCompletion();
})();
