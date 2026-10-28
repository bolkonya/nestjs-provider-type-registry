require('reflect-metadata')

const assert = require('node:assert/strict')
const { test } = require('node:test')
const { Inject } = require('@nestjs/common')
const { Test } = require('@nestjs/testing')

for (const format of ['cjs', 'esm']) {
  test(`published ${format} entry supports NestJS dependency injection`, async () => {
    const api =
      format === 'cjs' ? require('nestjs-provider-type-registry') : await import('nestjs-provider-type-registry')

    /** Базовый класс провайдера для проверки собранного пакета. */
    class BaseProvider {}
    /** Реализация провайдера для проверки обнаружения метаданных. */
    class ConcreteProvider extends BaseProvider {
      /** Получает зависимость из контейнера приложения. */
      constructor(value) {
        super()
        this.value = value
      }
    }

    const valueToken = `package-value-${format}`
    Inject(valueToken)(ConcreteProvider, undefined, 0)

    const type = api.defineProviderType({ id: `package-${format}`, provides: BaseProvider })
    api.createProviderTypeDecorator(type)('concrete')(ConcreteProvider)

    const moduleRef = await Test.createTestingModule({
      imports: [api.ProviderTypeRegistryModule.register(type)],
      providers: [ConcreteProvider, { provide: valueToken, useValue: 'injected-value' }],
    }).compile()

    try {
      await moduleRef.init()
      const registry = moduleRef.get(api.getProviderTypeRegistryToken(type))
      assert.equal(registry.getProviderByType('concrete'), moduleRef.get(ConcreteProvider))
      assert.equal(registry.getProviderByType('concrete').value, 'injected-value')
      assert.equal(registry.getProviderByTypeOrNull('missing'), null)
      assert.throws(() => registry.getProviderByType('missing'), api.ProviderTypeNotFoundError)
    } finally {
      await moduleRef.close()
    }
  })
}
