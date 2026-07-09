import { extendTheme } from "@chakra-ui/react";
import { GlobalStyleProps, mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: false },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        // Deep base with a subtle diagonal brand gradient. High-contrast text.
        bg: mode("#0b0b12", "#0b0b12")(props),
        bgImage:
          "radial-gradient(1200px 600px at 15% -10%, rgba(121,40,202,0.45), transparent), radial-gradient(1000px 600px at 110% 10%, rgba(255,0,128,0.40), transparent)",
        bgAttachment: "fixed",
        color: "whiteAlpha.900",
      },
    }),
  },
  fonts: {
    heading: "'Inter', system-ui, -apple-system, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
  },
});

export default theme;
