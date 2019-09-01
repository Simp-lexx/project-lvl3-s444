import os from 'os';
import path from 'path';
import url from 'url';
import { promises as fsPromises } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/pageLoader';

axios.defaults.adapter = httpAdapter;

test('Download page', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/courses';
  const expected = '<html><head></head><body></body></html>';

  const sourceFilePath = url.format({ host, pathname });
  console.log(sourceFilePath);
  const tmpDirName = path.resolve(os.tmpdir(), 'page-loader-');
  console.log(os.tmpdir());
  console.log(tmpDirName);

  nock(host).get(pathname).reply(200, expected);

  const tmpDir = await fsPromises.mkdtemp(tmpDirName);
  console.log(tmpDir);
  await pageLoader(sourceFilePath, tmpDir);
  const destFileName = await fsPromises.readdir(tmpDir);
  const destFilePath = path.join(tmpDir, destFileName[0]);
  const received = await fsPromises.readFile(destFilePath, 'utf8');

  expect(received).toBe(expected);
});
