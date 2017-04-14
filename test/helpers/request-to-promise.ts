import { createServer } from 'service-mocker/server';

import { uniquePath } from './unique-path';
import { sendRequest } from './send-request';

export async function requestToPromise(options: any = {}): Promise<any> {
  const {
    route = uniquePath(),
    init = {} as any,
    requestURL,
  } = options;

  const { router } = createServer();

  const method = init.method ? init.method.toLowerCase() : 'get';

  const promise = new Promise((resolve) => {
    router[method](route, (req, res) => {
      resolve(req);
      res.end();
    });
  });

  await sendRequest(requestURL || route, init);

  return promise;
}
