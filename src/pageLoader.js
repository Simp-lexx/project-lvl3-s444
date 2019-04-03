import { promises as fsPromises } from 'fs';
import axios from 'axios';
import buildDestPath from './utils';

export default (link, output) => {
  const destinationPath = buildDestPath(link, output);
  return axios.get(link).then(({ data }) => {
    fsPromises.writeFile(destinationPath, data).then(e => !e)
      .then(() => console.log(`${link} succesfully loaded`))
      .catch(err => (`${link} failed to load ${err}`));
  });
};
