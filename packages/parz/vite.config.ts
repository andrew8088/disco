import createConfig from "../config/vite.config";
import Unimport from "unimport/unplugin";

export default createConfig(__dirname, [
  Unimport.vite({
    dts: "./src/unimport.d.ts",
    imports: [{ name: "simpleFaker", as: "faker", from: "@faker-js/faker" }],
  }),
]);
