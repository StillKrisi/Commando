const { oneLine, stripIndents } = require('common-tags');
const Command = require('../../command');
const disambiguation = require('../../util').disambiguation;

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'util',
			memberName: 'reload',
			description: 'Reloads a command.',
			format: '<command>',
			details: oneLine`
				The argument must be the name (partial or whole) of a command.
				Only the bot owner may use this command.
			`,
			examples: ['reload some-command'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to reload?',
					validate: val => {
						if(!val) return false;
						const groups = this.client.registry.findGroups(val);
						if(groups.length === 1) return true;
						const commands = this.client.registry.findCommands(val);
						if(commands.length === 1) return true;
						if(commands.length === 0 && groups.length === 0) return false;
						return stripIndents`
							${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
							${groups.length > 1 ? disambiguation(groups, 'groups') : ''}
						`;
					},
					parse: val => this.client.registry.findCommands(val)[0] || this.client.registry.findGroups(val)[0]
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.author.id === this.client.options.owner;
	}

	async run(msg, args) {
		args.cmdOrGrp.reload();
		if(args.cmdOrGrp.group) {
			msg.reply(`Reloaded \`${args.cmdOrGrp.name}\` command.`);
		} else {
			msg.reply(`Reloaded all of the commands in the \`${args.cmdOrGrp.name}\` group.`);
		}
		return null;
	}
};
