import { nodeResolve } from "@rollup/plugin-node-resolve";
import eslint from "@rollup/plugin-eslint";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";

const isLiveMode = process.argv.indexOf("--live") !== -1;

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
  },
  plugins: [
    nodeResolve(),
    eslint(),
    typescript(),
    !isLiveMode && terser(),
    isLiveMode && serve("dist"),
    isLiveMode && livereload("dist"),
  ],
};
