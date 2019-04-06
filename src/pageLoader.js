import { promises as fsPromises } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import debug from 'debug';
import {
  formatName, buildFilesArray, getDirectLinks, updateLocalLinks,
} from './utils';

const writeLog = debug('page-loader');

export default (sourceUrl, destPath) => {
  const { protocol, hostname } = url.parse(sourceUrl);
  if (!protocol && !hostname) {
    const message = `Incorrent url ${sourceUrl}`;
    throw new Error(message);
  }

  const destFileName = formatName(sourceUrl, '.html');
  const destDirName = formatName(sourceUrl, '_files');

  const destFullFilePath = path.join(destPath, destFileName);
  const destDirPath = path.join(destPath, destDirName);

  let filesLinks = [];

  return axios.get(sourceUrl)
    .then((response) => {
      const getFilesArray = buildFilesArray(response.data);
      filesLinks = getDirectLinks(getFilesArray, sourceUrl);
      const htmlLocalLinks = updateLocalLinks(response.data, destDirName);
      writeLog(`Source page: ${sourceUrl}`);
      writeLog(`Destination file path: ${destFullFilePath}`);
      return fsPromises.writeFile(destFullFilePath, htmlLocalLinks);
    }).catch(error => console.error(error))
    .then(() => fsPromises.mkdir(destDirPath))
    .catch(error => console.error(error))
    .then(writeLog(`Dir is created ${destDirPath}`))
    .then(() => Promise.all(filesLinks.map(link => axios
      .get(link, { responseType: 'arraybuffer' }).catch(error => console.error(error))
      .then((response) => {
        const { pathname } = url.parse(link);
        const currentPathName = formatName(pathname.substring(1));
        const localFullPath = path.join(destDirPath, currentPathName);
        writeLog(`Write downloaded data to: ${localFullPath}`);
        return fsPromises.writeFile(localFullPath, response.data);
      }))))
    .catch((error) => {
      console.log(`Error ${error.message} occured.`);
      console.error(error);
      return Promise.reject(error);
    });
};
