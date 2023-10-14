'use strict'

// const Response = require('@adonisjs/vow/src/Response')

const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Get Challenges')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('can get all the challenges', async ({ assert, client }) => {
  assert.plan(2)
  
  const challenges = await Factory.model('App/Models/Challenge').createMany(3)

  const response = await client.get('/api/challenges').end()

  debugApiResponseError(response)

  response.assertStatus(200)

  response.assertJSONSubset([
    { title: challenges[0].title },
    { title: challenges[1].title },
    { title: challenges[2].title },
  ])
})
