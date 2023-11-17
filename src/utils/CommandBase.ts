import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";

export type CommandRegister = {
	commandBuilder: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	discordClient: Client<true>;
};

export type CommandExecution = {
	interaction: ChatInputCommandInteraction;
};

export abstract class CommandBase {
	private readonly discordClient: CommandRegister["discordClient"];
	private readonly slashCommandBuilder: CommandRegister["commandBuilder"];

	protected constructor({ commandBuilder, discordClient }: CommandRegister) {
		this.discordClient = discordClient;
		this.slashCommandBuilder = commandBuilder;
	}

  	protected getClient = () => this.discordClient;

	protected getCommandBuilder = () => this.slashCommandBuilder;

	abstract execute({ interaction }: CommandExecution): void | Promise<void>;
}
