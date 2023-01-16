import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PgClient } from '../database/pg-client.js';
import { AncestryTable } from '../database/sql/ancestry.js';
import { DagRenderer } from '../dag-renderer.js';
import { dagStratify } from 'd3-dag';
import { PersonTable } from '../database/sql/person.js';

const Tree = {
    data: new SlashCommandBuilder()
        .setName('tree')
        .setDescription('Show ancestry tree!')
        .addNumberOption(option =>
            option
                .setName('generations')
                .setDescription('Show ancestry tree. optional arg1 generations.')
                .setRequired(false)),
    async execute(interaction: CommandInteraction) {
        const generations = interaction.options.get('generations');
        if (!generations) {
            interaction.reply('under construction.. please use an argument like /tree 5');
        }
        else if (generations.value) {
            const pgClient = new PgClient();
            const ancestry = await pgClient.query(AncestryTable.getAncestry(interaction.user.id, Number(generations.value)));

            const create = dagStratify();

            const data: { id: string, name: string, parentIds: string[], color: string }[] = [];

            for (const row of ancestry.rows) {
                const child = row.child_id ? String(row.child_id) : null;
                const parent = (row.parent_id) ? String(row.parent_id) : null;

                const childFound = data.find(e => e.id === child);
                if (childFound !== undefined && parent != null) {
                    childFound.parentIds.push(parent);
                } else {
                    const parents = [];
                    if (parent) {
                        parents.push(parent);
                    }

                    if (child) {
                        data.push({
                            id: child,
                            name: (await interaction.client.users.fetch(child)).username,
                            parentIds: parents,
                            color: String((await pgClient.query(PersonTable.get(child))).rows[0].color)
                        });
                    }
                }
            }

            const dag = create(data);
            const newRender = new DagRenderer(dag, 900, 900, 220, 50, 25);
            await newRender.createImage();
            interaction.reply({ files: ['/home/boom/Concubine/images/dag.png'] });
        }
    }
}

export { Tree as Command };
