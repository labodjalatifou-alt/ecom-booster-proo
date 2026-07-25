const fs = require('fs');

let indexCode = fs.readFileSync('lib/telegram/commands/index.ts', 'utf8');
indexCode = indexCode.replace(/export async function handle(\w+)\(chatId: number(.*)\)/g, 'export async function handle$1(reply: (text: string, buttons?: any) => Promise<void>$2)');
indexCode = indexCode.replace(/await sendMessage\(chatId, (.*)\);/g, 'await reply($1);');
indexCode = indexCode.replace(/await sendMessageWithButtons\(chatId, (.*)\);/g, 'await reply($1);');
fs.writeFileSync('lib/telegram/commands/index.ts', indexCode);

let webhookCode = fs.readFileSync('lib/telegram/webhook-handler.ts', 'utf8');
webhookCode = webhookCode.replace(/await handle(\w+)\(chatId/g, 'await handle$1(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }');
if (!webhookCode.includes('sendMessageWithButtons')) {
  webhookCode = webhookCode.replace("import { sendMessage } from './client';", "import { sendMessage, sendMessageWithButtons } from './client';");
}
fs.writeFileSync('lib/telegram/webhook-handler.ts', webhookCode);

let parserCode = fs.readFileSync('lib/bot/parser.ts', 'utf8');
parserCode = parserCode.replace(/await originalHandler\(whatsappChatId, match.args\);/g, 'await originalHandler(async (text, buttons) => { responses.push(text); }, match.args);');
if (parserCode.includes('// Si échec (pas de chatId Telegram valide), c\'est normal')) {
  parserCode = parserCode.replace(
    "    } catch {\n      // Si échec (pas de chatId Telegram valide), c'est normal\n    }",
    "    } catch {\n      // Si échec, c'est normal\n    }\n\n    if (responses.length > 0) {\n      for (const res of responses) {\n        const cleanText = res.replace(/\\*/g, '*').replace(/_/g, '_');\n        await sendTextMessage(fromPhone, cleanText);\n      }\n    }"
  );
}
fs.writeFileSync('lib/bot/parser.ts', parserCode);
console.log("Refactor completed successfully.");
