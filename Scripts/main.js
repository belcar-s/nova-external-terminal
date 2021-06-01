exports.activate = function() {
	// Do work when the extension is activated
}

exports.deactivate = function() {
	// Clean up state before the extension is deactivated
}

function getTerminal(workspace) {
	if (workspace.config.get("terminal") != "Global Config") {
		return workspace.config.get("terminal");
	} else {
		return nova.config.get("terminal");
	}
}

const TERMINAL_LOCATIONS = new Map([
	["Apple Terminal", "/System/Applications/Utilities/Terminal.app"],
	["iTerm", "/Applications/iTerm.app"],
	["Alacritty", "/Applications/Alacritty.app"],
	["Hyper", "/Applications/Hyper.app"],
])

nova.commands.register("externalterminal.open", (workspace) => {
	const terminal = getTerminal(workspace);
	const TERMINAL_LOCATION = TERMINAL_LOCATIONS.get(terminal);


	let options;
	let process;
	if (terminal != "Alacritty") {
		options = {
			// Open Terminal.app with workspace.path set as the working directory, unless
			// there is no workspace.path.
			args: workspace.path
			                    ? [workspace.path, "-a", TERMINAL_LOCATION]
			                    : [TERMINAL_LOCATION],
		};

		process = new Process("/usr/bin/open", options);
	} else {
		options = {
			args: workspacepath
			                   ? ["alacritty", "--working-directory", workspace.path]
									 : ["alacritty"],
		};

		process = new Process("/usr/bin/env", options);
	}

	process.onStderr((msg) => console.error(msg));

	process.onDidExit((exitCode) => {
		if (exitCode != 0) {
			let notification = new NotificationRequest("non-zero");

			notification.title = nova.localize(
				"Couldn't find;" + terminal,
				"Couldn't find " + terminal
			);
			notification.body = nova.localize(
				"Move or pick a new terminal emulator;" + terminal,
				`Move ${terminal} to the Applications folder, or pick a new terminal in the extension's preferences page.`
			);

			notification.actions = [
				nova.localize("OK", "Dismiss"),
				nova.localize("Pick new one", "Pick a new terminal")
			];

			nova.notifications.add(notification).then((reply) => {
				if (reply.actionIdx == 1) {
					let options = {
						args: ["nova://extension/?id=belcar.Externalterminal&name=External%20Terminal"],
					}
					let process = new Process("/usr/bin/open", options)

					process.start();
				}
			});
		}
	});

	try {
		process.start();
	} catch (e) {
		let notification = new NotificationRequest("process-wasnt-started");

		notification.title = nova.localize(
			"Process wasn't started",
			"Attempt to start the Terminal was unsucessful"
		);
		notification.body = nova.localize(
			"Cause of process.start() errors",
			"An executable used by the extension may not have been found."
		);

		notification.actions = [nova.localize("OK", "Dismiss")];

		nova.notifications.add(notification);
	}
})
