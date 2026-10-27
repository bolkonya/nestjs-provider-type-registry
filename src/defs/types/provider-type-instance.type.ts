import type { ProviderType } from '../interfaces'

/** Извлекает тип экземпляра провайдера из описания семейства. */
export type ProviderTypeInstance<TProviderType extends ProviderType> =
  TProviderType extends ProviderType<infer TProvider, string> ? TProvider : never
