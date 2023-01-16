import { CommandInteraction, User } from 'discord.js';
import { PgClient } from '../database/pg-client.js';
import { AncestryTable } from '../database/sql/ancestry.js';
import { PersonTable } from '../database/sql/person.js';
const pgClient = new PgClient();

class AncestryLink {
    public constructor(interaction: CommandInteraction, reversed: boolean = false) {
        (async () => {
            await pgClient.query(PersonTable.upsert(interaction.user.id));

            const targetFound = interaction.options.getUser('target');

            if (!targetFound) {
                interaction.reply('Invalid user.');
            } else {
                await pgClient.query(PersonTable.upsert(targetFound.id));

                if (reversed) {
                    await this.insertLink(interaction, targetFound, interaction.user);
                } else {
                    await this.insertLink(interaction, interaction.user, targetFound);
                }
            }
        })();
    }

    public async insertLink(interaction: CommandInteraction, parent: User, child: User) {
        const client = await pgClient.getPool().connect();

        // FIX?!
        client.query(
            {
                text: `LISTEN cycle_watcher;`
            }
        );

        pgClient.query(AncestryTable.insert(parent.id, child.id));

        client.on('notification', msg => {
            if (!interaction.replied) {
                if (msg.payload == 'SUCCESS') {
                    interaction.reply(`${parent.username} adopted <@${child.id}>`);
                } else if (msg.payload == 'CYCLE') {
                    interaction.reply({ content: `\u26A0 ${parent.username} can't adopt ${child.username} because it would create a cyclic relationship.`, ephemeral: true });
                } else if (msg.payload == 'DUPE') {
                    interaction.reply({ content: `\u26A0 ${parent.username} is already the parent of ${child.username}`, ephemeral: true });
                }
            }
        });
    }
}

export { AncestryLink };
