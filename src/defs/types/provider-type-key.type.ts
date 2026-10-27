import type { ProviderType } from '../interfaces'

/** Извлекает допустимый строковый ключ из описания семейства провайдеров. */
export type ProviderTypeKey<TProviderType extends ProviderType> =
  TProviderType extends ProviderType<object, infer TKey> ? TKey : never
