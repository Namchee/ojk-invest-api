import ollama from 'ollama';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const model = 'llama3.1:8b';
const input = readFileSync(resolve(process.cwd(), 'experiment', 'data.csv')).toString();
const data = input.slice(1).split('\n');

const chunkSize = 12;
const chunks: string[][] = [];
for (let i = 0; i < data.length; i += chunkSize) {
  const chunk = data.slice(i, i + chunkSize);
  chunks.push(chunk);
}

const basePrompt = `Extract and clean the following information from the provided CSV

CSV Header:"Nama","Alamat","No. Telp","Website","Jenis Entitas","Jenis Kegiatan","Tgl Input","Keterangan"

1. Name
2. Address (Optional)
3. Phone Number (Optional)
4. E-mail
5. Website
6. Entity Type
7. Activity Type
8. Input Date
9. Input Code

and output them as a JSON with the following rules:

- If an entity contains a multiple name, use the first one as 'name' and store the rest as 'alias'
- Strip description text from Input Code. Input Code follows 'SP<number>/<roman_number>/SWI/<year>' format
- If the value is 'tidak diketahui' or its derivates, ignore it
- Address, Phone Number, Email, Website should be an array
- Aggregate all Facebook only links into a single entity`;

(async () => {
  const response = await ollama.chat({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a data extractor specialized in extracting and cleaning CSV data. Only output JSON and nothing else.',
      },
      {
        role: 'system',
        content: `## Schema

Output an array of JSON. Each item should have the following schema:

        {
          "name": string;
          "alias": string[];
          "address": string[];
          "phone": string[];
          "email": string[];
          "website": string[];
          "entity_type": string;
          "activity_type": string;
          "input_date": string;
          "input_code": string;
        }
  `,
      },
      {
        role: 'system',
        content: `## Rules

### Name and alias

If 'Nama' column has multiple names, only use the first name as value for 'name' field.

Moreover, strip all other explanatory text. Explanatory text should NOT be treated as alias.

Example:

Input: Alipinjaman - Ali Pinjaman Uang Kilat Dana Kredit
Output: Alipinjaman

### Duplicate Entities

If a row shares EXACT name with another row, treat it as one singular entity, with the later row treated like an alias.

Lower upper case should be ignored.

### Input code

This field should be extracted from 'Keterangan'. Extract ONLY 'SP<num>/<roman>/SWI/<year>'. Strip all other text.

### Ignore List

If the value is 'tidak diketahui' or its derivates, treat it as no value.

### Facebook

If the row only contains information regarding a facebook link and nothing else except entity, activity, input_date, and input_code, treat it as singular entity and aggregate it as an alias.`,
      },
      {
        role: 'system',
        content: `## Data Header
"Nama","Alamat","No. Telp","Website","Jenis Entitas","Jenis Kegiatan","Tgl Input","Keterangan"`,
      },
      {
        role: 'user',
        content: `## Data\n${chunks[0].join('\n')}`,
      },
      {
        role: 'user',
        content: `## Output\n`,
      },
    ],
  });

  console.log(response.message.content);
})();
