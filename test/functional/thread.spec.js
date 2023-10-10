'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Thread')
/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('can create threads', async ({ assert, client }) => {
  assert.plan(2)

  const response = await client
    .post('/threads')
    .send({
      title: 'test title',
      body: 'body'
    })
    .end()

  response.assertStatus(200)

  const thread = await Thread.firstOrFail()
  response.assertJSONSubset({ thread: thread.toJSON() })
})

test('can delete threads', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await Factory.model('App/Models/Thread').create()

  const response = await client
    .delete(thread.url())
    .send()
    .end()

  debugApiResponseError(response)
  response.assertStatus(204)
  assert.equal(await Thread.getCount(), 0)
})
