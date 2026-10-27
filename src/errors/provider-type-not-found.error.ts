/** Ошибка обращения к отсутствующему провайдеру. */
export class ProviderTypeNotFoundError extends Error {
  /**
   * Создает ошибку отсутствующего провайдера.
   * @param registryId идентификатор реестра
   * @param typeKey запрошенный ключ провайдера
   * @param availableTypeKeys зарегистрированные ключи провайдеров
   */
  public constructor(
    public readonly registryId: string,
    public readonly typeKey: string,
    public readonly availableTypeKeys: readonly string[],
  ) {
    const available = availableTypeKeys.join(', ') || 'none'
    super(`Provider '${typeKey}' is not registered in registry '${registryId}'. Available: ${available}`)
    this.name = ProviderTypeNotFoundError.name
  }
}
