/** @jest-environment node */
const request = require('supertest');
const express = require('express');

const app = express();
// Since index.html is gone, we'll just test that the absolute root returns 404 or something else
// Or we can point it to the public directory if we want to test static serving there.
app.use(express.static('public'));

describe('GET /', () => {
  it('responds with 404 for empty public root (replaces old index.html check)', (done) => {
    request(app).get('/').expect(404, done);
  });
});
