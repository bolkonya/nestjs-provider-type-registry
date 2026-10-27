import type { Abstract } from '@nestjs/common'

/** Описание семейства провайдеров, объединенных общим базовым классом и ключом метаданных. */
export interface ProviderType<TProvider extends object = object, TKey extends string = string> {
  /** Ключ метаданных, используемый декоратором семейства. */
  readonly id: string

  /** Базовый класс, от которого должны наследоваться провайдеры семейства. */
  readonly provides: Abstract<TProvider>

  /** Фиктивное поле для сохранения типа ключа без влияния на рантайм-контракт. */
  readonly keyType?: TKey
}
