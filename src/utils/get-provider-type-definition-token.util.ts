/**
 * Возвращает внутренний токен определения семейства провайдеров.
 * @returns внутренний NestJS-токен
 */
export function getProviderTypeDefinitionToken(): symbol {
  return Symbol.for('nestjs-provider-type-registry:definition')
}
