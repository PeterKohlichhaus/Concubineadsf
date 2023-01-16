import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PgClient } from '../database/pg-client.js';
import { PersonTable } from '../database/sql/person.js';

const NodeColor = {
    data: new SlashCommandBuilder()
        .setName('node-color')
        .setDescription('Sets the color of your node!')
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('The hex color')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        const pgClient = new PgClient();
        const colorFound = interaction.options.get('color');
        if (colorFound) {
            console.log(colorFound.value);
            await pgClient.query(PersonTable.setColor(interaction.user.id, String(colorFound.value)));
            interaction.reply(`Node color set to: ${colorFound.value}`);
        }
    }
};

export { NodeColor as Command };
