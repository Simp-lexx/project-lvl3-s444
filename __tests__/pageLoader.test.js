import os from 'os';
import path from 'path';
import url from 'url';
import { promises as fsPromises } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const beforeHtmlPath = path.join(__dirname, '__fixtures__', 'before_index.html');
const afterHtmlPath = path.join(__dirname, '__fixtures__', 'after_index.html');
const imagePath = path.join(__dirname, '__fixtures__', 'image.png');
const scriptPath = path.join(__dirname, '__fixtures__', 'script.txt');
const linkPath = path.join(__dirname, '__fixtures__', 'style.css');

test('Test download page to local folder', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/courses';
  const expected = '<html><head></head><body></body></html>';

  const sourceFilePath = url.format({ host, pathname });
  const tmpDirName = path.resolve(os.tmpdir(), 'page-loader-');
  const tmpDir = await fsPromises.mkdtemp(tmpDirName);

  nock(host).get(pathname).reply(200, expected);

  await loadPage(sourceFilePath, tmpDir);
  const destFileName = await fsPromises.readdir(tmpDir);
  const destFilePath = path.join(tmpDir, destFileName[0]);
  const received = await fsPromises.readFile(destFilePath, 'utf8');

  expect(received).toBe(expected);
});

test('Test download page with links', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/';
  const imgPath = '/test/image.png';
  const scrPath = '/test/script.js';
  const lnkPath = '/test/style.css';
  const filesBody = 'body';
  const before = await fsPromises.readFile(beforeHtmlPath, 'utf8');
  const after = await fsPromises.readFile(afterHtmlPath, 'utf8');

  const sourceFilePath = url.format({ host, pathname });
  const tmpDirName = path.join(os.tmpdir(), 'page-loader-');
  const tmpDir = await fsPromises.mkdtemp(tmpDirName);

  nock(host)
    .get(pathname)
    .reply(200, before)
    .get(imgPath)
    .reply(200, filesBody)
    .get(scrPath)
    .reply(200, filesBody)
    .get(lnkPath)
    .reply(200, filesBody);

  await loadPage(sourceFilePath, tmpDir);
  const destFileName = await fsPromises.readdir(tmpDir);
  const destFilePath = path.join(tmpDir, destFileName[0]);
  const received = await fsPromises.readFile(destFilePath, 'utf8');
  expect(received).toBe(after);
});

test('Download files', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/';
  const imgPath = '/test/image.png';
  const scrPath = '/test/script.txt';
  const lnkPath = '/test/style.css';

  const sourceFilePath = url.format({ host, pathname });
  const tempDirName = path.join(os.tmpdir(), 'page-loader-');

  const beforeHtml = await fsPromises.readFile(beforeHtmlPath, 'utf8');
  const expectedImage = await fsPromises.readFile(imagePath, 'utf8');
  const expectedScript = await fsPromises.readFile(scriptPath, 'utf8');
  const expectedCss = await fsPromises.readFile(linkPath, 'utf8');

  nock(host)
    .get(pathname)
    .reply(200, beforeHtml)
    .get(imgPath)
    .reply(200, expectedImage)
    .get(scrPath)
    .reply(200, expectedScript)
    .get(lnkPath)
    .reply(200, expectedCss);

  const tempDir = await fsPromises.mkdtemp(tempDirName);
  await loadPage(sourceFilePath, tempDir);

  const jpgPath = path.join(tempDir, 'hexlet-io_files/test-image.png');
  const jsPath = path.join(tempDir, 'hexlet-io_files/test-script.txt');
  const cssPath = path.join(tempDir, 'hexlet-io_files/test-style.css');

  const receivedImage = await fsPromises.readFile(jpgPath, 'utf8');
  const receivedScript = await fsPromises.readFile(jsPath, 'utf8');
  const receivedCss = await fsPromises.readFile(cssPath, 'utf8');


  expect(receivedImage).toBe(expectedImage);
  expect(receivedScript).toBe(expectedScript);
  expect(receivedCss).toBe(expectedCss);
});

describe('Error tests', () => {
  const host = 'http://test.com';
  test('wrong output', async () => {
    const testPath = '/';
    const link = host.concat(testPath);
    const output = 'folder/folder';
    try {
      await loadPage(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
  test('incorrect url', async () => {
    const tempDir = await fsPromises.mkdtemp(
      path.resolve(os.tmpdir(), 'page-loader-'),
    );
    const link = 'incorrect url';
    const output = tempDir;
    try {
      await loadPage(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
  test('can\'t load resource', async () => {
    const document = '<!DOCTYPE html><html><head><link href="/folder/file.css"></head><body></body></html>';
    const tempDir = await fsPromises.mkdtemp(
      path.resolve(os.tmpdir(), 'page-loader-'),
    );
    const testPath = '/';
    const link = host.concat(testPath);
    const output = tempDir;

    nock(host)
      .get(testPath)
      .reply(200, document);

    try {
      await loadPage(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
});
