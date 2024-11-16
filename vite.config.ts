import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 添加全局插件来支持 Buffer 和其他 Node 全局对象
    NodeGlobalsPolyfillPlugin({
      buffer: true,
    }),
  ],
  resolve: {
    alias: {
      // 设置 alias，让 Vite 在浏览器环境中找到正确的 buffer 实现
      buffer: "buffer",
    },
  },
  server: {
    open: true,
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["buffer"], // 确保 buffer 被包含

    exclude: ["lucide-react"],

    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
