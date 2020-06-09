const Ajv = require('ajv');

const loginSchemaValidation = require('../json-schemas/login-schema.json');
const registerSchemaValidation = require('../json-schemas/register-schema.json');
const createUpdatePostSchemaValidation = require('../json-schemas/create-update-post-schema.json');

class SchemaValidatorService {

  constructor() {
    this.ajv = Ajv({
      allErrors: true,
      removeAdditional: 'all'
    });

    this.ajv.addSchema(loginSchemaValidation, 'login-user');
    this.ajv.addSchema(registerSchemaValidation, 'register-user');
    this.ajv.addSchema(createUpdatePostSchemaValidation, 'create-update-post');

  }

  /**
   * Custom validation
   * @param {String} schemaName
   * @param {Object} ctx
   */

  async customSchemaValidation(schemaName, ctx) {
    const valid = await this.ajv.validate(schemaName, ctx.request.body);

    if (!valid) {
      const error = this.errorResponse(this.ajv.errors);
      ctx.throw(400, error.errors[0].message);
    }

    return "success";
  }

  /**
   * Error response
   * @param schemaErrors
   */
  errorResponse(schemaErrors) {
    const errors = schemaErrors.map((error) => {
      return {
        path: error.dataPath.slice(1),
        message: error.message
      };
    });

    return {
      message: 'Validation failed',
      errors: errors
    };
  }

}

module.exports = new SchemaValidatorService();