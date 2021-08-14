import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
  },
  plugins: [
    nodeResolve(),
    typescript(),
    process.argv.indexOf("--live") !== -1 && serve("dist"),
    process.argv.indexOf("--live") !== -1 && livereload("dist"),
  ],
};
