import { whatsappClient } from './whatsapp/client.js';

const result = await whatsappClient.pupPage.evaluate(() => {
  const chats = window.Store?.Chat?.models || [];
  return chats.slice(0, 20).map((chat) => ({
    id: chat?.id?._serialized || chat?.id,
    name: chat?.name,
    formattedTitle: chat?.formattedTitle,
    isGroup: chat?.isGroup,
    hasGroupMetadata: !!chat?.groupMetadata,
    keys: Object.keys(chat || {}).slice(0, 15),
  }));
});

console.log(JSON.stringify(result, null, 2));
