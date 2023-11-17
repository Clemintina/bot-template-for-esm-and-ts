import { Client, Events, IntentsBitField, Partials, REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
// @ts-ignore - This works in production, pino need to update their types to support esm
import pino from "pino/pino";
import { readdirSync } from "fs";
import path, { dirname } from "node:path";
import { CommandBase, CommandRegister } from "./utils/CommandBase.js";
import i18n from "./i18n/index.js";
import i18next from "i18next";
import { fileURLToPath } from "url";
import { ButtonBase } from "./utils/ButtonBase.js";

const pinoLogger = pino as unknown as typeof pino.default;
export const logger = pinoLogger({
    name: "Seraph",
    transports: ['pino-pretty']
});
export const BOT_FILE_HOME = dirname(fileURLToPath(import.meta.url));

// Change these for your own bot
const intents = [IntentsBitField.Flags.Guilds,IntentsBitField.Flags.GuildMembers,IntentsBitField.Flags.DirectMessages];

const client = new Client({
    intents,
    partials: [Partials.Channel, Partials.GuildMember],
});

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

client.on(Events.ClientReady, async (readyClient) => {
    logger.info("Ready to work, i'm called " + readyClient.user.username);

    i18next.init({
        resources: i18n,
    });

    const commandMap = new Map<string, CommandBase>();
    const commands: CommandRegister["commandBuilder"][] = [];
    const commandPaths = readdirSync(path.join(BOT_FILE_HOME, "commands"), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const commandPathRaw of commandPaths) {
        const commandsPath = path.join(BOT_FILE_HOME, "commands", commandPathRaw);
        const files = readdirSync(commandsPath).filter((f) => f.endsWith(".js") || f.endsWith(".ts"));
        for (const file of files) {
            const resolvePath = path.join(commandsPath, file);
            const defaultImport = (await import(resolvePath)).default;
            const command = new defaultImport(readyClient);
            commands.push(command.getCommandBuilder());
            commandMap.set(command.getCommandBuilder().name, command);
        }
    }

    const buttomMap = new Map<string, ButtonBase>();
    const buttonPaths = readdirSync(path.join(BOT_FILE_HOME, "buttons"), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const buttonPathRaw of buttonPaths) {
        const buttonsPath = path.join(BOT_FILE_HOME, "buttons", buttonPathRaw);
        const files = readdirSync(buttonsPath).filter((f) => f.endsWith(".js") || f.endsWith(".ts"));
        for (const file of files) {
            const resolvePath = path.join(buttonsPath, file);
            const defaultImport = (await import(resolvePath)).default;
            const button = new defaultImport(readyClient);
            buttomMap.set(button.getButtonPrefix(), button);
        }
    }

    await rest.put(Routes.applicationCommands(client.application!.id), { body: commands });

    readyClient.on(Events.InteractionCreate, async (publicInteraction) => {
        if (publicInteraction.isChatInputCommand()) {
            const commandName = publicInteraction?.commandName;
            if (commandName && commandMap.has(commandName)) {
                commandMap.get(commandName)?.execute({ interaction: publicInteraction });
            }
        } else if (publicInteraction.isButton()) {
            const buttonPrefix = publicInteraction.customId.split(':')[0];
            if (buttonPrefix && buttomMap.has(buttonPrefix)) {
                buttomMap.get(buttonPrefix)?.execute({ interaction: publicInteraction, args:[...publicInteraction.customId.split(':').slice(1)] });
            }
        }
    });
});

client.login(process.env.DISCORD_TOKEN);
