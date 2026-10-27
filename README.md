# nestjs-provider-type-registry

Type-safe, decorator-driven provider registries for NestJS. Define a provider family, decorate its implementations with keys, and resolve instances through a typed registry.

The registry discovers providers through NestJS metadata, validates their base class, and rejects duplicate keys during module initialization. It has no storage, network, or application-specific dependencies.

## Requirements and installation

Node.js 20+, NestJS 11, and TypeScript with `experimentalDecorators` and `emitDecoratorMetadata` enabled.

```bash
npm install nestjs-provider-type-registry @nestjs/common @nestjs/core reflect-metadata rxjs
```

The same peer dependencies are required when installing with Yarn or pnpm. Import `reflect-metadata` once in your application's entry point.

## Define a provider family

```typescript
import {
  createProviderTypeDecorator,
  defineProviderType,
  InjectProviderTypeRegistry,
  ProviderTypeRegistryModule,
  ProviderTypeRegistryService,
} from 'nestjs-provider-type-registry'
import { Injectable, Module } from '@nestjs/common'

abstract class NotificationChannel {
  public abstract send(message: string): Promise<void>
}

const channelType = defineProviderType<NotificationChannel, 'email' | 'sms'>({
  id: 'notification-channel',
  provides: NotificationChannel,
})

const Channel = createProviderTypeDecorator(channelType)

@Injectable()
@Channel('email')
class EmailChannel extends NotificationChannel {
  public async send(message: string): Promise<void> {
    // Call your email integration here.
  }
}

@Injectable()
class NotificationsService {
  public constructor(
    @InjectProviderTypeRegistry(channelType)
    private readonly channels: ProviderTypeRegistryService<typeof channelType>,
  ) {}

  public async send(message: string): Promise<void> {
    await this.channels.getProviderByType('email').send(message)
  }
}

@Module({
  imports: [ProviderTypeRegistryModule.register(channelType)],
  providers: [EmailChannel, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

Register every implementation as a NestJS provider. Its constructor dependencies use normal NestJS dependency injection. Access registries after module initialization, for example from request handlers or `onApplicationBootstrap`.

## API and behavior

| Export                                                    | Purpose                                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `defineProviderType<TProvider, TKey>(definition)`         | Describe a provider family with an application-wide unique `id` and an abstract base class in `provides`. |
| `createProviderTypeDecorator(definition)`                 | Create a class decorator accepting a typed provider key.                                                  |
| `ProviderTypeRegistryModule.register(definition)`         | Register a registry for that family.                                                                      |
| `InjectProviderTypeRegistry(definition)`                  | Inject a family's registry into a constructor.                                                            |
| `getProviderTypeRegistryToken(definition)`                | Get its NestJS injection token, including for custom factory providers.                                   |
| `ProviderTypeRegistryService<typeof definition>`          | Registry with inferred key and instance types.                                                            |
| `ProviderType`, `ProviderTypeKey`, `ProviderTypeInstance` | Public contracts and inference helpers.                                                                   |

`registry.getProviderByType(key)` returns an implementation or throws `ProviderTypeNotFoundError`. `getProviderByTypeOrNull(key)` returns `null` for missing keys. Module initialization throws `DuplicateProviderTypeError` for duplicate keys and `InvalidProviderTypeError` when an implementation does not extend the configured base class.

Different family IDs have independent registries and may reuse provider keys. Discovery scans the application container: registries are separated by family ID, not by the module declaring an implementation. Use singleton providers; request-scoped and transient providers are not supported. Multiple modules using the same family ID refer to the same family, so choose a unique ID for unrelated registries.

Both CommonJS (`require`) and ESM (`import`) entry points include TypeScript declarations. NestJS and its runtime peers remain external to the bundle.

## Development

Use Node.js 24 and Yarn 4.10.3 through Corepack. All dependencies come from the public npm registry; no corporate registry credentials are needed.

```bash
corepack enable
yarn install --immutable
yarn check
```

`yarn check` runs TypeScript, ESLint, Prettier, unit tests, the build, and integration tests of the built CommonJS and ESM entry points. CI runs on Node.js 20, 22, and 24. `npm pack --dry-run` shows the publication contents; only `dist`, package metadata, the README, and the license are published.

Husky runs lint-staged before commits and commitlint on commit messages. Use Conventional Commits such as `feat: add a registry option` and `fix: handle missing providers`. PR titles are checked as squash commit messages. This personal project does not require Jira IDs or corporate branch names.

## Releases and public npm publishing

The `Release` workflow runs on `main`. Release Please opens a version/changelog PR based on Conventional Commits. Merging it creates a GitHub release with a `v<version>` tag. The same workflow checks out that exact tag, reruns all checks, and publishes to **https://registry.npmjs.org** with public access and provenance using npm trusted publishing (OIDC).

Versions and changelogs are managed by Release Please. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) and [Release Please Action](https://github.com/googleapis/release-please-action).

## License

MIT — see [LICENSE](LICENSE).
