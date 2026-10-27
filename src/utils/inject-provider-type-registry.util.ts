import { Inject } from '@nestjs/common'

import type { ProviderType } from '../defs'
import { getProviderTypeRegistryToken } from './get-provider-type-registry-token.util'

/**
 * Создает декоратор внедрения реестра указанного семейства провайдеров.
 * @param providerType описание семейства провайдеров
 * @returns декоратор параметра конструктора
 */
export function injectProviderTypeRegistry(providerType: ProviderType): ParameterDecorator {
  return Inject(getProviderTypeRegistryToken(providerType))
}
