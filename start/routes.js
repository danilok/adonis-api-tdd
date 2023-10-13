'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.get('/', 'ChallengeController.all')
  Route.get('/:id', 'ChallengeController.show')
}).prefix('/api/challenges')

Route.group(() => {
  Route.post('/', 'ChallengeController.store').validator('CreateChallenge')
  Route.put('/:id', 'ChallengeController.update').validator('UpdateChallenge')
  Route.delete('/:id', 'ChallengeController.destroy')
}).prefix('/api/challenges').middleware(['auth'])

Route.get('/api/me/challenges/', 'MeController.challenges')
  .middleware(['auth'])

Route.group(() => {
  Route.get('/', 'MovieController.index')
}).prefix('/api/movies')

Route.resource('/threads', 'ThreadController')
  .only(['store', 'destroy', 'update'])
  .middleware(new Map([
    [['store', 'destroy', 'update'], ['auth']],
    [['destroy', 'update'], ['modifyThreadPolicy']],
  ]))
