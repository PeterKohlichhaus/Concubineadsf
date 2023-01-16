import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { AncestryLink } from '../utils/ancestry-link.js';

const Parent = {
    data: new SlashCommandBuilder()
        .setName('parent')
        .setDescription('parent a user!')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        new AncestryLink(interaction, true);
    }
};

export { Parent as Command };
