import { defineConfig } from 'tsup'

/** Настройки сборки публичного пакета с метаданными NestJS-декораторов. */
export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
  target: 'es2020',
  outDir: 'dist',
  sourcemap: true,
  external: ['@nestjs/common', '@nestjs/core', 'reflect-metadata', 'rxjs'],
})
