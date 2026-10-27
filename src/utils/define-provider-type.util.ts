import type { ProviderType } from '../defs'

/**
 * Сохраняет конкретные типы экземпляра и ключа в описании семейства провайдеров.
 * @param definition описание семейства провайдеров
 * @returns типизированное описание без изменения рантайм-значения
 */
export const defineProviderType = <TProvider extends object, TKey extends string = string>(
  definition: ProviderType<TProvider, TKey>,
): ProviderType<TProvider, TKey> => definition
