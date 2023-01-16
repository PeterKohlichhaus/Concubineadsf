import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { AncestryLink } from '../utils/ancestry-link.js';

const Adopt = {
    data: new SlashCommandBuilder()
        .setName('adopt')
        .setDescription('Adopt a user!')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        new AncestryLink(interaction);
    }
};

export { Adopt as Command };
