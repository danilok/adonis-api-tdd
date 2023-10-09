'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Search Movie')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('can query for a certain movie title', async ({ assert, client }) => {
  assert.plan(2)

  await Factory.model('App/Models/Movie').create({ title: 'Joker' })

  const response = await client
    .get('/api/movies?title=Joker')
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSONSubset([{
    title: 'Joker',
  }])
})

test('can query with a subset of the title', async ({ assert, client }) => {
  assert.plan(2)

  await Factory.model('App/Models/Movie').create({ title: 'Joker' })

  const response = await client
    .get('/api/movies')
    .query({ title: 'jok'})
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSONSubset([{
    title: 'Joker',
  }])
})

test('should throw 400 if no title is pass', async ({ assert, client }) => {
  assert.plan(2)

  const response = await client.get('/api/movies').end()

  const expected = { error: 'title is required' }

  response.assertStatus(400)
  response.assertError(expected)
})

test('should throw 404 if non existent title is pass', async ({ assert, client }) => {
  assert.plan(2)

  const response = await client
    .get('/api/movies')
    .query({ title: 'batman'})
    .end()

  response.assertStatus(404)
  response.assertJSON([])
})
