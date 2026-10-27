import type { ProviderType } from '../defs'

/**
 * Возвращает стабильный NestJS-токен реестра для семейства провайдеров.
 * @param providerType описание семейства провайдеров
 * @returns токен реестра
 */
export const getProviderTypeRegistryToken = (providerType: ProviderType): string =>
  `NESTJS_PROVIDER_TYPE_REGISTRY:${providerType.id}`
