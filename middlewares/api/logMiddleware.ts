export const logMiddleware = (req: Request) => {
	return {
		response: req.method + " " + req.url,
	};
}