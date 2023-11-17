import got from "got";

export const botHttpClient = got.extend({
	headers: {
		// Put all custom headers here
		"Cache-Control": "no-cache",
	},
});
