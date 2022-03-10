import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    name: schema.string({}),
    email: schema.string({}, [
      rules.email(), rules.unique({
        table: 'users',
        column: 'email'
      })
    ]),
    password: schema.string({}),
    gender: schema.string({}),
    birth_city_id: schema.number([
      rules.exists({
        table: 'cities',
        column: 'id'
      })
    ]),
    birth_time: schema.date({}),
    verification_code: schema.number()
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {
    'required': 'O campo {{field}} é obrigatório.',
    'email.email': 'Este e-mail não é válido.',
    'email.unique': 'Este e-mail já está em uso!',
    'birth_city_id.exists': 'A cidade selecionada não existe.'
  }
}
