/** Ошибка повторной регистрации ключа внутри одного реестра. */
export class DuplicateProviderTypeError extends Error {
  /**
   * Создает ошибку повторной регистрации.
   * @param registryId идентификатор реестра
   * @param typeKey дублирующийся ключ провайдера
   */
  public constructor(
    public readonly registryId: string,
    public readonly typeKey: string,
  ) {
    super(`Provider type '${typeKey}' is already registered in registry '${registryId}'`)
    this.name = DuplicateProviderTypeError.name
  }
}
