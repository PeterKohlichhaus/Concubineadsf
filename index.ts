import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Bot } from './bot.js';

dotenv.config();

const bot = new Bot(new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] }));
const client = bot.getClient();

client.once('ready', async () => {
    console.log('ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const found = bot.getCommands().get(interaction.commandName);

    if (!found) return;
    await found.Command.execute(interaction);
});
