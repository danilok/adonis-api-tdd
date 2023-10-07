'use strict'

const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Get Challenge')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('can get a challenge by id', async ({ assert, client }) => {
  assert.plan(2)
  
  const challenges = await Factory.model('App/Models/Challenge').createMany(3)

  const challenge = challenges[0]

  const response = await client.get(`/api/challenges/${challenge.id}`).end()

  debugApiResponseError(response)

  response.assertStatus(200)

  response.assertJSONSubset({ title: challenge.title, id: challenge.id })
})

test('status 404 if id do not exist', async ({ assert, client }) => {
  assert.plan(1)
  
  const response = await client.get(`/api/challenges/999`).end()

  response.assertStatus(404)
})
