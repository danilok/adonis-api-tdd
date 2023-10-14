'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Read Thread')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('can access single resource', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await factory('App/Models/Thread').create()

  const response = await client
    .get(thread.url())
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSON({ thread: thread.toJSON() })
})

test('can access all resources', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await factory('App/Models/Thread').createMany(3)

  const response = await client
    .get('threads')
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSON({ threads: thread.map(thread => thread.toJSON()).sort((a, b) => a.id - b.id) })
})
