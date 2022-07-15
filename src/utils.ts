/**
 * Shows an alert and throws an exception, both with `msg`. Use this for fatal errors.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function error(msg: string): never {
	window.alert(msg);
	throw Error(msg);
}
