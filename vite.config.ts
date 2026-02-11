import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
	const cloudflareEnv = process.env.CLOUDFLARE_ENV || mode;

	return {
		base: "/_admin/",
		plugins: [
			react(),
			cloudflare({
				configPath: "./wrangler.jsonc",
				persistState: false,
				viteEnvironment: {
					name: cloudflareEnv ? cloudflareEnv.replace(/-/g, "_") : undefined,
				},
				config: (config) => {
					const envConfig =
						cloudflareEnv && typeof config.env === "object"
							? (config.env as Record<string, { name?: string }>)[
									cloudflareEnv
							  ]
							: undefined;
					return envConfig?.name ? { name: envConfig.name } : {};
				},
			}),
		],
	};
});
