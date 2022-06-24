import Joi from 'joi';

const schema = Joi.object({
    username: Joi.string().empty(),
    to: Joi.string().empty(),
    text: Joi.string().empty(),
    type: Joi.any().valid('message','private_message')
})

const isValid = async (object) => {
    let isValid = true
    try {
        await schema.validateAsync(object)
    } catch (err) {
        isValid = false;
        //console.log(err);
    }
    return isValid;
};

export default isValid;