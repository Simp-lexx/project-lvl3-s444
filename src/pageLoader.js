import { promises as fsPromises } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import { formatName, getFiles, getDirectLinks, updateLocalLinks } from './utils';


// export default (link, output) => {
//   const destinationPath = buildDestPath(link, output);
//   return axios.get(link).then(({ data }) => {
//     fsPromises.writeFile(destinationPath, data).then(e => !e)
//       .then(() => console.log(`${link} succesfully loaded`))
//       .catch(err => (`${link} failed to load ${err}`));
//   });
// };

export default (sourceUrl, destPath) => {
  const fileName = formatName(sourceUrl, '.html');
  const baseFilePath = path.join(destPath, fileName);

  const dirName = formatName(sourceUrl, '_files');
  const dirPath = path.join(baseFilePath, dirName);

  let filesLinks = [];

  return axios.get(sourceUrl)
    .then((response) => {
      const files = getFiles(response.data);
      filesLinks = getDirectLinks(files, sourceUrl);
      const htmlLocalLinks = updateLocalLinks(response.data, dirName);
      return fsPromises.writeFile(baseFilePath, htmlLocalLinks);
    })
    .then(() => fsPromises.mkdir(dirPath))
    .then(() => Promise.all(filesLinks.map(link => axios
      .get(link, { responseType: 'arraybuffer' })
      .then((response) => {
        const { pathname } = url.parse(link);
        const currentName = formatName(pathname.substring(1));
        const currentFilePath = `${dirPath}/${currentName}`;
        return fsPromises.writeFile(currentFilePath, response.data);
      }))))
    .catch((error) => {
      console.log(`${error.message}. Error occured. Url: ${url}`);
      return error.response;
    });
};