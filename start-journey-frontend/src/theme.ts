import { extendTheme } from "@chakra-ui/react";
import { mode, GlobalStyleProps } from "@chakra-ui/theme-tools";
const bg = "#06060a";

const theme = extendTheme({
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        bg: mode(bg, bg)(props),
        color: "white",
        bgGradient: "linear(to-l, #7928CA, #FF0080)",
      },
    }),
  },
});

export default theme;
