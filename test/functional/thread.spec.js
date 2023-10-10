'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Thread')
/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')

trait('Test/ApiClient')

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