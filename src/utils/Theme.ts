import { createTheme } from "@material-ui/core/styles";
import { teal, red, green, indigo, blue } from "@material-ui/core/colors";

// Create a theme instance.
export const theme = createTheme({
    zIndex: {
        appBar: 1,
        drawer: 0,
    },
    // typography: {
    //     fontFamily: "Manrope"
    // },
    palette: {
        type: 'dark',
        primary: red,
        secondary: teal,
    },
});
