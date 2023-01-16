import path from 'path';
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { promisify } from 'util';
import glob from 'glob';
import { fileURLToPath } from 'node:url';
import { Command } from '../bot';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const globPromise = promisify(glob);

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandFiles: string[] = await globPromise(`${__dirname}/../commands/*.js`);

for (const file of commandFiles) {
    const Command = (await import(file)).Command as Command;
    commands.push(Command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands }
        ) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
