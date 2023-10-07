'use strict'

const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, before } = use('Test/Suite')('CreateChallengeValidator')
/** @type {typeof import('@adonisjs/validator/src/Validator')} */
const { validate, validateAll } = use('Validator')

/** @type {typeof import('app/Validators/CreateChallenge')} */
const CreateChallenge = use('App/Validators/CreateChallenge');

/** @typedef {import('chai')} Chai */
// https://www.chaijs.com/api/assert/

let createChallengeValidator
let rules
let messages
let runRalidation
let validTitle
let validDescription

before(async () => {
  createChallengeValidator = new CreateChallenge()
  rules = createChallengeValidator.rules
  messages = createChallengeValidator.messages
  const isToValidateAll = createChallengeValidator.validateAll
  runRalidation = (data) => {
    return isToValidateAll
    ? validateAll(data, rules, messages)
    : validate(data, rules, messages)
  }
  const { title, description } = await Factory.model('App/Models/Challenge').make()
  validTitle = title
  validDescription = description
});

/**
 * @param {object} ctx
 * @param {Chai.AssertStatic} ctx.assert
 */
async function forceTyping ({ assert }) {
  assert.equal(true, true)
}

test('ensure typing for assert parameter', forceTyping)

test("validation should pass when valid data is given", async ({ assert }) => {
  assert.plan(1)

  const data = {
    title: validTitle,
    description: validDescription,
  };

  const validation = await runRalidation(data)
  const isValidationFailed = validation.fails()

  assert.isNotTrue(isValidationFailed)
})

test("validation should not pass when invalid description is given", async ({ assert }) => {
  assert.plan(2)

  const data = {
    title: validTitle,
    description: 123,
  };

  const validation = await runRalidation(data)
  const isValidationFailed = validation.fails()
  const errorMessages = validation.messages()

  assert.isTrue(isValidationFailed)
  assert.deepEqual(errorMessages, [
    {
      message: 'description is not a valid string',
      field: 'description',
      validation: 'string'
    }
  ])
})

test("validation should not pass when invalid title is given", async ({ assert }) => {
  assert.plan(2)

  const data = {
    title: 123,
    description: validDescription,
  };

  const validation = await runRalidation(data)
  const isValidationFailed = validation.fails()
  const errorMessages = validation.messages()

  assert.isTrue(isValidationFailed)
  assert.deepEqual(errorMessages, [
    {
      message: 'title is not a valid string',
      field: 'title',
      validation: 'string'
    }
  ])
})

test("validation should not pass when none valid data is given", async ({ assert }) => {
  assert.plan(3)

  const data = {
    title: 123,
    description: 123,
  };

  const validation = await runRalidation(data)
  const isValidationFailed = validation.fails()
  const errorMessages = validation.messages()

  assert.isTrue(isValidationFailed)
  assert.equal(errorMessages.length, 2, 'numbers of messages is wrong')
  assert.deepEqual(errorMessages, [
    {
      message: 'title is not a valid string',
      field: 'title',
      validation: 'string'
    },
    {
      message: 'description is not a valid string',
      field: 'description',
      validation: 'string'
    }
  ])
})

