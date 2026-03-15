import _ from 'lodash';
import cors from 'cors';
import express from 'express';
import { createError } from './utils';
import auth from './api/controllers/middlewares/auth';
import refresh from './api/controllers/tokenRefresh';
import { LeadsController } from './api/controllers';
import routes from './api/routes';

const app = express();

app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }));
app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.post('/refresh', refresh);
app.post('/leads/partner-callback', LeadsController.partnerCallback);
app.get('/', (_req, res) =>
  res.send('Nawgati Insurance service is running as safe you are while driving on indian roads.')
);
app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.use(auth);
app.use(routes);

app.use((_req, _res, next) => next(createError(404, 'requested endpoint not found')));

app.use((err, req, res, _next) => {
  console.error(err.message);
  console.log(err);

  let status = _.get(err, 'status', 500);
  let payload = {
    ..._.pick(err, ['code']),
    type: 'error',
    message: _.get(err, 'message', 'Internal Server Error'),
  };

  if (err.extra) {
    payload = { ...payload, ...err.extra };
  }

  const timestamp = new Date().toISOString();

  if (err.type === 'POSTGRESQL_ERROR') {
    status = 500;
    payload.code = err.code;
    payload.message = 'Internal Server Error';
  }

  const fullUrl = `${req.protocol}://${req.get('host') + req.originalUrl}`;
  console.log({ fullUrl });

  console.error(`${timestamp} | ${status} | ${payload.message}`);
  res.status(status).json(payload);
} );


module.exports = app;
