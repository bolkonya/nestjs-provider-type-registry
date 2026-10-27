import { Inject, Injectable, type OnModuleInit, type Type } from '@nestjs/common'
import { DiscoveryService, ModuleRef, Reflector } from '@nestjs/core'

import { type ProviderType, type ProviderTypeInstance, type ProviderTypeKey } from './defs'
import { DuplicateProviderTypeError, InvalidProviderTypeError, ProviderTypeNotFoundError } from './errors'
import { getProviderTypeDefinitionToken } from './utils/get-provider-type-definition-token.util'

/** Реестр экземпляров одного семейства NestJS-провайдеров. */
@Injectable()
export class ProviderTypeRegistryService<TProviderType extends ProviderType = ProviderType> implements OnModuleInit {
  private readonly providersByType = new Map<ProviderTypeKey<TProviderType>, ProviderTypeInstance<TProviderType>>()

  /**
   * Создает реестр провайдеров.
   * @param discovery сервис обнаружения NestJS-провайдеров
   * @param moduleRef ссылка на контейнер зависимостей
   * @param reflector сервис чтения метаданных
   * @param providerType описание семейства провайдеров
   */
  public constructor(
    private readonly discovery: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly reflector: Reflector,
    @Inject(getProviderTypeDefinitionToken()) private readonly providerType: TProviderType,
  ) {}

  /** Находит и проверяет все провайдеры, отмеченные декоратором семейства. */
  public onModuleInit(): void {
    for (const wrapper of this.discovery.getProviders()) {
      const metatype = wrapper.metatype as Type<unknown> | undefined
      if (!metatype) continue

      const typeKey = this.reflector.get<ProviderTypeKey<TProviderType>>(this.providerType.id, metatype)
      if (typeKey === undefined) continue

      if (this.providersByType.has(typeKey)) {
        throw new DuplicateProviderTypeError(this.providerType.id, typeKey)
      }

      const instance: unknown = wrapper.instance ?? this.moduleRef.get<unknown>(metatype, { strict: false })
      if (!(instance instanceof this.providerType.provides)) {
        throw new InvalidProviderTypeError(this.providerType.id, typeKey, this.providerType.provides.name)
      }

      this.providersByType.set(typeKey, instance as ProviderTypeInstance<TProviderType>)
    }
  }

  /**
   * Возвращает провайдер по ключу без ошибки при его отсутствии.
   * @param typeKey ключ провайдера
   * @returns экземпляр провайдера или `null`
   */
  public getProviderByTypeOrNull(typeKey: ProviderTypeKey<TProviderType>): ProviderTypeInstance<TProviderType> | null {
    return this.providersByType.get(typeKey) ?? null
  }

  /**
   * Возвращает провайдер по ключу.
   * @param typeKey ключ провайдера
   * @returns экземпляр провайдера
   * @throws ProviderTypeNotFoundError если ключ не зарегистрирован
   */
  public getProviderByType(typeKey: ProviderTypeKey<TProviderType>): ProviderTypeInstance<TProviderType> {
    const provider = this.getProviderByTypeOrNull(typeKey)
    if (!provider) {
      throw new ProviderTypeNotFoundError(this.providerType.id, typeKey, [...this.providersByType.keys()])
    }

    return provider
  }
}
