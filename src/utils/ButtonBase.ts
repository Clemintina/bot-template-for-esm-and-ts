import {ButtonInteraction, Client} from "discord.js";

export type ButtonRegister = {
	discordClient: Client<true>;
	buttonPrefix: string;
};

export type ButtonExecution = {
	interaction: ButtonInteraction;
	args: string[];
};

export abstract class ButtonBase {
	private readonly discordClient: ButtonRegister["discordClient"];
	private readonly buttonPrefix: ButtonRegister["buttonPrefix"];

	protected constructor({ buttonPrefix, discordClient }: ButtonRegister) {
		this.discordClient = discordClient;
		this.buttonPrefix = buttonPrefix;
	}

  protected getClient = () => this.discordClient;

	protected getButtonPrefix = () => this.buttonPrefix;

	abstract execute({ interaction, args }: ButtonExecution): void | Promise<void>;
}
