/** Ошибка регистрации провайдера с неподходящим базовым классом. */
export class InvalidProviderTypeError extends Error {
  /**
   * Создает ошибку несовместимого провайдера.
   * @param registryId идентификатор реестра
   * @param typeKey ключ провайдера
   * @param expectedBaseClassName имя ожидаемого базового класса
   */
  public constructor(
    public readonly registryId: string,
    public readonly typeKey: string,
    public readonly expectedBaseClassName: string,
  ) {
    super(`Provider '${typeKey}' in registry '${registryId}' must extend '${expectedBaseClassName}'`)
    this.name = InvalidProviderTypeError.name
  }
}
