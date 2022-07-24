const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const { Handler } = require('./Handler');

const app = new Koa();
const handler = new Handler();

app.use(koaBody(
  {
    formidable: true,
    urlencoded: true,
    json: true,
  },
));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.querystring === 'createTicket') {
    const key = Object.keys(ctx.request.body);
    const value = key[0];
    handler.registerTicket(JSON.parse(value));
    ctx.response.body = {
      action: 'createTicket',
      ticket: {
        id: handler.tickets[handler.tickets.length - 1].id,
        status: handler.tickets[handler.tickets.length - 1].status,
        created: handler.tickets[handler.tickets.length - 1].created,
        name: handler.tickets[handler.tickets.length - 1].name,
      },
    };
  }
  await next();
});

app.use(async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.querystring === 'changeStatus') {
    const key = Object.keys(ctx.request.body);
    const value = key[0];
    handler.changeTicketStatus(JSON.parse(value));
    const ticketId = handler.findTicket(JSON.parse(value));
    ctx.response.body = JSON.stringify({
      action: 'changeStatus',
      ticket: handler.tickets[ticketId],
    });
  }

  await next();
});

app.use(async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.querystring === 'removeTicket') {
    const key = Object.keys(ctx.request.body);
    const value = key[0];
    const ticketId = handler.findTicket(JSON.parse(value));
    ctx.response.body = {
      action: 'removeTicket',
      ticket: handler.tickets[ticketId],
    };
    handler.removeTicket(JSON.parse(value));
  }

  await next();
});

app.use(async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.querystring === 'editTicket') {
    const key = Object.keys(ctx.request.body);
    const value = key[0];
    handler.editTicket(JSON.parse(value));
    const ticketId = handler.findTicket(JSON.parse(value));
    ctx.response.body = {
      action: 'editTicket',
      ticket: {
        id: handler.tickets[ticketId].id,
        name: handler.tickets[ticketId].name,
        description: handler.tickets[ticketId].description,
      },
    };
  }

  await next();
});

app.use(async (ctx, next) => {
  if (ctx.request.method === 'GET') {
    const actionAndValue = ctx.request.url.split('?')[1];
    const parts = actionAndValue.split('&');
    const action = parts[0].split('=')[1];
    const value = {};
    for (let i = 1; i < parts.length; i += 1) {
      const currentPair = parts[i].split('=');
      value[currentPair[0]] = currentPair[1];
    }

    if (action === 'getDescription') {
      const ticketId = handler.findTicket(value);
      ctx.response.body = {
        action: 'getDescription',
        ticket: {
          id: handler.tickets[ticketId].id,
          description: handler.tickets[ticketId].description,
        },
      };
    }

    if (action === 'getAllTickets') {
      ctx.response.body = {
        action: 'getAllTickets',
        ticket: handler.tickets,
      };
    }

    await next();
  }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
