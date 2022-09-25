import html from "@web/rollup-plugin-html";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.html",
  output: { dir: "dist" },
  plugins: [nodeResolve(), html(), typescript()],
};
