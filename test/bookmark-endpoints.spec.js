/* eslint-disable quotes */
const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    //console.log(process.env.TEST_DB_URL);
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmark_data').truncate());

  afterEach('cleanup', () => db('bookmark_data').truncate());

  describe(`GET /bookmarks`, () => {
    context('Given no bookmarks', () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/bookmarks').set({'Authorization': `Bearer ${process.env.API_TOKEN}`}).expect(200, []);
      });
    });
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmark_data')
          .insert(testBookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set({'Authorization': `Bearer ${process.env.API_TOKEN}`})
          .expect(200, testBookmarks);
      });
    });
  });

  describe(`GET /bookmarks/:bookmark_id`, () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app).get(`/bookmarks/${bookmarkId}`)
          .set({'Authorization': `Bearer ${process.env.API_TOKEN}`})
          .expect(404, {error: {message: `Bookmark doesn't exist`}});
      });
    });
    context('Given there are articles in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert articles', () => {
        return db
          .into('bookmark_data')
          .insert(testBookmarks);
      });

      it('responds with 200 and the specified article', () => {
        const bookmarkId = 5;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({'Authorization': `Bearer ${process.env.API_TOKEN}`})
          .expect(200, expectedBookmark);
      });
    });
  });
});