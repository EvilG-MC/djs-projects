const { ChatInputCommandInteraction, Client, EmbedBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, ModalBuilder, PermissionsBitField, TextInputStyle, ButtonStyle } = require("discord.js");
const DB = require("../Schemas/GiveawayDB");
const { endGiveaway } = require("../Utils/GiveawayFunctions");

module.exports = {
    name: "giveaway",
    description: "Create or manage a giveaway",
    defaultMemberPermissions: PermissionsBitField.Flags.ManageGuild,
    dmPermission: false,
    botPermissions: ["SendMessages"],
    options: [
        {
            name: "create",
            description: "Create a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "manage",
            description: "Manage a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "toggle",
                    description: "Provide an option to manage",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: "End", value: "end" },
                        { name: "Pause", value: "pause" },
                        { name: "Unpause", value: "unpause" },
                        { name: "Reroll", value: "reroll" },
                        { name: "Delete", value: "delete" },
                    ]
                },
                {
                    name: "message_id",
                    description: "Provide the message ID of the giveaway",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "create": {
                const prize = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("giveaway-prize")
                        .setLabel("Prize")
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(256)
                        .setRequired(true)
                );

                const winners = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("giveaway-winners")
                        .setLabel("Winner Count")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                );

                const duration = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("giveaway-duration")
                        .setLabel("Duration")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Example: 1 day")
                        .setRequired(true)
                );
                
                const modal = new ModalBuilder()
                    .setCustomId("giveaway-options")
                    .setTitle("Create a Giveaway")
                    .setComponents(prize, winners, duration);

                await interaction.showModal(modal);
            }
            break;

            case "manage": {
                const embed = new EmbedBuilder();
                const messageId = interaction.options.getString("message_id");
                const toggle = interaction.options.getString("toggle");

                const data = await DB.findOne({
                    GuildID: interaction.guild.id,
                    MessageID: messageId
                });
                if (!data) {
                    embed
                        .setColor("Red")
                        .setDescription(`Could not find any giveaway with that message ID`);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const message = (await interaction.guild.channels.cache.get(data.ChannelID).messages.fetch(messageId));
                if (!message) {
                    embed
                        .setColor("Red")
                        .setDescription(`This giveaway doesn't exist`);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                if (["end", "reroll"].includes(toggle)) {
                    if (data.Ended === (toggle === "end" ? true : false)) {
                        embed
                            .setColor("Red")
                            .setDescription(`This giveaway has ${toggle === "end" ? "already ended" : "not ended"}`);
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    if (data.Paused === (toggle === "end" ? true : false)) {
                        embed
                            .setColor("Red")
                            .setDescription(`This giveaway is paused. Unpause it before ending the giveaway`);
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    endGiveaway(message, (toggle === "end" ? false : true));

                    embed
                        .setColor("Green")
                        .setDescription(`The giveaway has ${toggle === "end" ? "ended" : "been rerolled"}`);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                if (["pause", "unpause"].includes(toggle)) {
                    if (data.Paused === (toggle === "pause" ? true : false)) {
                        embed
                            .setColor("Red")
                            .setDescription(`This giveaway is already ${toggle === "pause" ? "paused" : "unpaused"}`);
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    const button = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("giveaway-join")
                            .setEmoji("🎉")
                            .setStyle(ButtonStyle.Success)
                            .setLabel("Join Here")
                            .setDisabled(toggle === "pause" ? true : false)
                    );

                    const giveawayEmbed = new EmbedBuilder()
                        .setColor(toggle === "pause" ? "Yellow" : "#156789")
                        .setTitle(`${data.Prize}`)
                        .setDescription(`**Hosted By**: <@${data.HostedBy}>\n**Winners**: ${data.Winners}\n**Ends In**: <t:${data.EndTime}:R> (<t:${data.EndTime}>)`)
                        .setTimestamp(parseInt(data.EndTime) * 1000);

                    await DB.findOneAndUpdate({
                        GuildID: interaction.guild.id,
                        MessageID: message.id
                    }, {
                        Paused: toggle === "pause" ? true : false
                    });
                    
                    await message.edit({ content: `🎉 **Giveaway ${toggle === "pause" ? "Paused" : "Started"}** 🎉`, embeds: [giveawayEmbed], components: [button] });

                    embed
                        .setColor("Green")
                        .setDescription(`The giveaway has been ${toggle === "pause" ? "paused" : "unpaused"}`);
                    interaction.reply({ embeds: [embed], ephemeral: true });

                    if (toggle === "unpause" && (data.EndTime * 1000) < Date.now()) endGiveaway(message);
                }

                if (toggle === "delete") {
                    await DB.deleteOne({
                        GuildID: interaction.guild.id,
                        MessageID: message.id
                    });

                    message.delete();
                    embed
                        .setColor("Green")
                        .setDescription(`The giveaway has been deleted`);
                    interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            break;
        }
    },
};
