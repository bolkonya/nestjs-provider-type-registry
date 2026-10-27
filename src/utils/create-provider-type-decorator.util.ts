import { SetMetadata } from '@nestjs/common'

import type { ProviderType, ProviderTypeKey } from '../defs'

/**
 * Создает декоратор класса для привязки провайдера к ключу реестра.
 * @param providerType описание семейства провайдеров
 * @returns декоратор с типизированным ключом провайдера
 */
export const createProviderTypeDecorator =
  <TProviderType extends ProviderType>(providerType: TProviderType) =>
  (type: ProviderTypeKey<TProviderType>): ClassDecorator =>
    SetMetadata(providerType.id, type)
