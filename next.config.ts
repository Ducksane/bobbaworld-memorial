import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Generates `messages/fr.d.json.ts` so message keys and ICU arguments are type-checked.
    createMessagesDeclaration: "./messages/fr.json",
  },
});

const nextConfig: NextConfig = { experimental: { globalNotFound: true } };

export default withNextIntl(nextConfig);
