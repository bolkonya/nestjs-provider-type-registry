import { type DynamicModule, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { type ProviderType } from './defs'
import { ProviderTypeRegistryService } from './provider-type-registry.service'
import { getProviderTypeDefinitionToken } from './utils/get-provider-type-definition-token.util'
import { getProviderTypeRegistryToken } from './utils/get-provider-type-registry-token.util'

/** Динамический модуль изолированного реестра одного семейства провайдеров. */
@Module({})
export class ProviderTypeRegistryModule {
  /**
   * Регистрирует изолированный реестр провайдеров.
   * @param providerType описание семейства провайдеров
   * @returns динамический NestJS-модуль
   */
  public static register(providerType: ProviderType): DynamicModule {
    const registryToken = getProviderTypeRegistryToken(providerType)

    return {
      module: ProviderTypeRegistryModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: getProviderTypeDefinitionToken(), useValue: providerType },
        { provide: registryToken, useClass: ProviderTypeRegistryService },
      ],
      exports: [registryToken],
    }
  }
}
