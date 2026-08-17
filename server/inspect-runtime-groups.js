import { whatsappClient, initializeWhatsapp, waitForWhatsappReady } from './whatsapp/client.js';

await initializeWhatsapp();
await waitForWhatsappReady(180000);

console.log('state', await whatsappClient.getState());

const chats = await whatsappClient.getChats();
console.log('chat count', chats.length);

const sample = chats.slice(0, 30).map((chat) => ({
  id: chat?.id?._serialized || chat?.id,
  name: chat?.name,
  formattedTitle: chat?.formattedTitle,
  isGroup: chat?.isGroup,
  groupMetadata: !!chat?.groupMetadata,
  contactName: chat?.contact?.name,
  participantCount: chat?.groupMetadata?.participants?.length,
  keys: Object.keys(chat || {}).slice(0, 20),
}));

console.log(JSON.stringify(sample, null, 2));

const fromPage = await whatsappClient.pupPage.evaluate(() => {
  const models = window.Store?.Chat?.getModelsArray?.() || window.Store?.Chat?.models || [];
  const arr = Array.isArray(models) ? models : Array.from(models || []);
  return arr.slice(0, 30).map((chat) => ({
    id: chat?.id?._serialized || chat?.id,
    name: chat?.name,
    formattedTitle: chat?.formattedTitle,
    isGroup: chat?.isGroup,
    hasGroupMetadata: !!chat?.groupMetadata,
    keys: Object.keys(chat || {}).slice(0, 20),
  }));
});

console.log('FROM PAGE');
console.log(JSON.stringify(fromPage, null, 2));
