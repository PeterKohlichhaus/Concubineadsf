import { CacheType, Client, Collection, Interaction, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'util';
import glob from 'glob';

const globPromise = promisify(glob);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const commandsPath = path.join(__dirname, 'commands');
const commandFiles: string[] = await globPromise(`${__dirname}/commands/*.js`);

//MOVE THIS
export type Command = {
    Command: any;
    data: SlashCommandBuilder;
    execute: (interaction: Interaction<CacheType>) => Promise<any>;
};

class Bot {
    private client;
    private commands = new Collection<string, Command>();

    public constructor(client: Client) {
        this.client = client;
        this.start();
    }

    private async start() {
        dotenv.config();

        commandFiles.map(async (value) => {
            const file: Command = await import(value);
            const name = path.basename(value, path.extname(value));
            this.commands.set(name, file);
        });

        this.client.login(process.env.TOKEN);
    }

    public getCommands() {
        return this.commands;
    }

    public getClient(): Client<boolean> {
        return this.client;
    }
}

export { Bot };
