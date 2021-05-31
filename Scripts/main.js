exports.activate = function() {
	// Do work when the extension is activated
}

exports.deactivate = function() {
	// Clean up state before the extension is deactivated
}

nova.commands.register("externalterminal.open", (workspace) => {
	const TERMINAL_LOCATION = "/System/Applications/Utilities/Terminal.app";

	let options = {
		// Open Terminal.app with workspace.path set as the working directory, unless
		// there is no workspace.path.
		args: workspace.path
					? [workspace.path, "-a", TERMINAL_LOCATION]
					: [TERMINAL_LOCATION],
	};

	let process = new Process("/usr/bin/open", options);

	process.onStderr((msg) => console.error(msg));
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

		notification.actions = [nova.localize("OK", "OK")];

		nova.notifications.add(notification);
	}
})
