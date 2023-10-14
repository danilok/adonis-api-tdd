'use strict'

const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, before } = use('Test/Suite')('UpdateChallengeValidator')
/** @type {typeof import('@adonisjs/validator/src/Validator')} */
const { validate, validateAll } = use('Validator')

/** @type {typeof import('app/Validators/UpdateChallenge')} */
const UpdateChallenge = use('App/Validators/UpdateChallenge')

/** @typedef {import('chai')} Chai */
// https://www.chaijs.com/api/assert/

let updateChallengeValidator
let rules
let messages
let runValidation
let validTitle
let validDescription

before(async () => {
  updateChallengeValidator = new UpdateChallenge()
  rules = updateChallengeValidator.rules
  messages = updateChallengeValidator.messages
  const isToValidateAll = updateChallengeValidator.validateAll
  runValidation = (data) => {
    return isToValidateAll
      ? validateAll(data, rules, messages)
      : validate(data, rules, messages)
  }
  const { title, description } = await Factory.model('App/Models/Challenge').make()
  validTitle = title
  validDescription = description
})

test('validation should pass when valid data is given', async ({ assert }) => {
  assert.plan(1)

  const data = {
    title: validTitle,
    description: validDescription,
  }

  const validation = await runValidation(data)
  const isValidationFailed = validation.fails()

  assert.isNotTrue(isValidationFailed)
})

test('validation should pass when no data is given', async ({ assert }) => {
  assert.plan(1)

  const data = {}

  const validation = await runValidation(data)
  const isValidationFailed = validation.fails()

  assert.isNotTrue(isValidationFailed)
})

test('validation should not pass when invalid description is given', async ({ assert }) => {
  assert.plan(2)

  const data = {
    title: validTitle,
    description: 123,
  }

  const validation = await runValidation(data)
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

test('validation should not pass when invalid title is given', async ({ assert }) => {
  assert.plan(2)

  const data = {
    title: 123,
    description: validDescription,
  }

  const validation = await runValidation(data)
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

test('validation should not pass when none valid data is given', async ({ assert }) => {
  assert.plan(3)

  const data = {
    title: 123,
    description: 123,
  }

  const validation = await runValidation(data)
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
