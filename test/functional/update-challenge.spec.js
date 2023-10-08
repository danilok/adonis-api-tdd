'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Update Challenge')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('a user can update a challenge owned', async ({ assert, client }) => {
  assert.plan(2)

  const user = await Factory.model('App/Models/User').create()
  const challenge = await Factory.model('App/Models/Challenge').make()

  await user.challenges().save(challenge)

  const data = {
    title: 'This is my new title'
  }

  const response = await client
    .put(`/api/challenges/${challenge.id}`)
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)

  response.assertJSONSubset({
    id: challenge.id,
    title: data.title,
  })
})

test('a user cannot update a challenge owned if given title is invalid', async ({ assert, client }) => {
  assert.plan(2)

  const user = await Factory.model('App/Models/User').create()
  const challenge = await Factory.model('App/Models/Challenge').make()

  await user.challenges().save(challenge)

  const data = {
    title: 123
  }

  const response = await client
    .put(`/api/challenges/${challenge.id}`)
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)

  response.assertJSONSubset([
    {
      message: 'title is not a valid string',
      field: 'title',
      validation: 'string'
    }
  ])
})

test('cannot update a challenge if not the author', async ({ assert, client }) => {
  assert.plan(3)

  const user = await Factory.model('App/Models/User').create()
  const otherUser = await Factory.model('App/Models/User').create()
  const challenge = await Factory.model('App/Models/Challenge').make()

  await otherUser.challenges().save(challenge)

  const data = {
    title: 'This is my new title'
  }

  const response = await client
    .put(`/api/challenges/${challenge.id}`)
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(401)
  assert.equal(response.error.text, 'Not authorized')

  const _challenge = await use('App/Models/Challenge').find(challenge.id)

  assert.notEqual(_challenge.title, data.title)
})
