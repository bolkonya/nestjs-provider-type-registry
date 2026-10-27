import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'

import {
  createProviderTypeDecorator,
  defineProviderType,
  DuplicateProviderTypeError,
  getProviderTypeRegistryToken,
  InvalidProviderTypeError,
  ProviderTypeNotFoundError,
  ProviderTypeRegistryModule,
  ProviderTypeRegistryService,
} from '.'

describe('ProviderTypeRegistry', () => {
  it('обнаруживает отмеченные провайдеры и возвращает их по ключу', async () => {
    /** Базовый провайдер тестового реестра. */
    abstract class TestProvider {
      /** Возвращает тестовое значение. */
      public abstract getValue(): string
    }

    const providerType = defineProviderType<TestProvider, 'first'>({
      id: 'test-provider',
      provides: TestProvider,
    })
    const TestProviderType = createProviderTypeDecorator(providerType)

    @Injectable()
    @TestProviderType('first')
    class FirstProvider extends TestProvider {
      /** Возвращает тестовое значение. */
      public getValue(): string {
        return 'first'
      }
    }

    const moduleRef = await Test.createTestingModule({
      imports: [ProviderTypeRegistryModule.register(providerType)],
      providers: [FirstProvider],
    }).compile()

    await moduleRef.init()

    const registry = moduleRef.get<ProviderTypeRegistryService<typeof providerType>>(
      getProviderTypeRegistryToken(providerType),
    )

    expect(registry.getProviderByType('first')).toBe(moduleRef.get(FirstProvider))
    expect(registry.getProviderByTypeOrNull('first')?.getValue()).toBe('first')

    await moduleRef.close()
  })

  it('сохраняет ключ в метаданных декоратора', () => {
    /** Базовый провайдер тестового реестра. */
    abstract class TestProvider {}

    const providerType = defineProviderType<TestProvider, 'decorated'>({
      id: 'metadata-provider',
      provides: TestProvider,
    })
    const TestProviderType = createProviderTypeDecorator(providerType)

    @TestProviderType('decorated')
    class DecoratedProvider extends TestProvider {}

    expect(new Reflector().get(providerType.id, DecoratedProvider)).toBe('decorated')
    expect(getProviderTypeRegistryToken(providerType)).toBe('NESTJS_PROVIDER_TYPE_REGISTRY:metadata-provider')
  })

  it('изолирует реестры разных семейств', async () => {
    /** Базовый провайдер первого тестового реестра. */
    abstract class FirstBase {}
    /** Базовый провайдер второго тестового реестра. */
    abstract class SecondBase {}

    const firstType = defineProviderType<FirstBase, 'shared'>({ id: 'first-registry', provides: FirstBase })
    const secondType = defineProviderType<SecondBase, 'shared'>({ id: 'second-registry', provides: SecondBase })
    const FirstType = createProviderTypeDecorator(firstType)
    const SecondType = createProviderTypeDecorator(secondType)

    @Injectable()
    @FirstType('shared')
    class FirstProvider extends FirstBase {}

    @Injectable()
    @SecondType('shared')
    class SecondProvider extends SecondBase {}

    const moduleRef = await Test.createTestingModule({
      imports: [ProviderTypeRegistryModule.register(firstType), ProviderTypeRegistryModule.register(secondType)],
      providers: [FirstProvider, SecondProvider],
    }).compile()

    await moduleRef.init()

    const firstRegistry = moduleRef.get<ProviderTypeRegistryService<typeof firstType>>(
      getProviderTypeRegistryToken(firstType),
    )
    const secondRegistry = moduleRef.get<ProviderTypeRegistryService<typeof secondType>>(
      getProviderTypeRegistryToken(secondType),
    )

    expect(firstRegistry.getProviderByType('shared')).toBeInstanceOf(FirstProvider)
    expect(secondRegistry.getProviderByType('shared')).toBeInstanceOf(SecondProvider)

    await moduleRef.close()
  })

  it('запрещает повторную регистрацию ключа', async () => {
    /** Базовый провайдер тестового реестра. */
    abstract class TestProvider {}

    const providerType = defineProviderType<TestProvider, 'duplicate'>({
      id: 'duplicate-registry',
      provides: TestProvider,
    })
    const TestProviderType = createProviderTypeDecorator(providerType)

    @Injectable()
    @TestProviderType('duplicate')
    class FirstProvider extends TestProvider {}

    @Injectable()
    @TestProviderType('duplicate')
    class SecondProvider extends TestProvider {}

    const moduleRef = await Test.createTestingModule({
      imports: [ProviderTypeRegistryModule.register(providerType)],
      providers: [FirstProvider, SecondProvider],
    }).compile()

    let initializationError: unknown
    try {
      await moduleRef.init()
    } catch (error) {
      initializationError = error
    }

    expect(initializationError).toBeInstanceOf(DuplicateProviderTypeError)
  })

  it('проверяет наследование от базового класса', async () => {
    /** Базовый провайдер тестового реестра. */
    abstract class TestProvider {}

    const providerType = defineProviderType<TestProvider, 'invalid'>({ id: 'invalid-registry', provides: TestProvider })
    const TestProviderType = createProviderTypeDecorator(providerType)

    @Injectable()
    @TestProviderType('invalid')
    class InvalidProvider {}

    const moduleRef = await Test.createTestingModule({
      imports: [ProviderTypeRegistryModule.register(providerType)],
      providers: [InvalidProvider],
    }).compile()

    let initializationError: unknown
    try {
      await moduleRef.init()
    } catch (error) {
      initializationError = error
    }

    expect(initializationError).toBeInstanceOf(InvalidProviderTypeError)
  })

  it('возвращает null или типизированную ошибку для отсутствующего ключа', async () => {
    /** Базовый провайдер тестового реестра. */
    abstract class TestProvider {}

    const providerType = defineProviderType<TestProvider>({ id: 'empty-registry', provides: TestProvider })
    const moduleRef = await Test.createTestingModule({
      imports: [ProviderTypeRegistryModule.register(providerType)],
    }).compile()

    await moduleRef.init()

    const registry = moduleRef.get<ProviderTypeRegistryService<typeof providerType>>(
      getProviderTypeRegistryToken(providerType),
    )

    expect(registry.getProviderByTypeOrNull('missing')).toBeNull()
    expect(() => registry.getProviderByType('missing')).toThrow(ProviderTypeNotFoundError)

    await moduleRef.close()
  })
})
