import Joi from 'joi';

const schema = Joi.object({
    username: Joi.string()
        .empty()
})

const validations = async (object) => {
    try {
        await schema.validateAsync(object)
    } catch (err) {
        throw 422;
    }

};

export default validations;