# Changelog

## [0.1.1](https://github.com/bolkonya/nestjs-provider-type-registry/compare/v0.1.0...v0.1.1) (2026-10-28)

### Features

- Support NestJS 12 alongside NestJS 11.
- Check both NestJS versions across Node.js 20, 22, and 24 in CI.

### Bug Fixes

- Run Jest in ESM mode to load NestJS 12 on all supported Node.js versions.
- Verify application dependency injection through the built CommonJS and ESM entry points.

## 0.1.0 (2026-10-27)

### Features

- Initial public release of typed, decorator-driven NestJS provider registries.
- Provider discovery, base-class validation, duplicate detection, and typed lookup errors.
- CommonJS and ESM builds with TypeScript declarations.
