const hapi = require('hapi');
const server = new hapi.Server();
const boom = require('boom');
const Joi = require('joi');
const leftPad = require('left-pad')
const zmq = require('zmq')

server.connection({
  port: process.env.PORT || 8999
});

function defaultErrorHandler(reply) {
  return (s, err) => {
    console.log(s);
    reply(500);
  };
}

// static files
server.register(require('inert'), (err) => {
  if (err)
    throw err;
  server.route({
    method: 'GET',
    path: '/static/{fn*}',
    config: {
      auth: false,
    },
    handler: {
      file: function(request) {
        return 'static/' + request.params.fn;
      },
    }
  });
});

server.route({
  method: 'GET',
  path: '/',
  config: {
    auth: false,
  },
  handler: function(request, reply) {
    reply.redirect('/static/index.html');
  },
});

server.route({
  method: 'GET',
  path: '/routes/search',
  config: {
    tags: ['api'],
    description: `Search for existing, matching routes`,
    validate: {
      query: {
        origin_lat: Joi.number(),
        origin_lng: Joi.number(),
        destination_lat: Joi.number(),
        destination_lng: Joi.number(),
        time: Joi.number(),
      }
    }
  },
  async handler(request, reply) {
    reply([]);
  },
});

server.route({
  method: 'GET',
  path: '/routes/propose',
  config: {
    tags: ['api'],
    description: `Given a origin/dest, propose start/end points that may be feasible`,
    validate: {
      query: {
        origin_lat: Joi.number().required(),
        origin_lng: Joi.number().required(),
        destination_lat: Joi.number().required(),
        destination_lng: Joi.number().required(),
        time: Joi.number(),
        settings: Joi.object(),
      }
    }
  },
  async handler(request, reply) {
    try {
      var result = await new Promise((resolve, reject) => {
        var sock = zmq.socket('req')

        sock.connect('tcp://127.0.0.1:5555')

        sock.send(JSON.stringify({
          type: 'suggestRoutes',
          payload: {
            startLat: request.query.origin_lat,
            startLng: request.query.origin_lng,
            endLat: request.query.destination_lat,
            endLng: request.query.destination_lng,
            time: 8 * 3600 * 1000,
            settings: request.query.settings
          }
        }))

        sock.on('message', m => resolve(JSON.parse(m)))
        setTimeout(() => {
          sock.unref();
          reject(new Error("Timed out"));
        }, 2 * 60000);
      })
      reply(result);
    } catch (e) {
      console.log(e.stack);
      reply(e);
    }
  },
});

server.start()
.then(() => {
  console.log(`Server started on port ${server.info.port}`)
})
.catch((err) => {
  console.error(`Ooops ${err.message}`)
  console.log(err.stack)
});
