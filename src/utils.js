import url from 'url';
import path from 'path';

export default (link, options) => {
  const { hostName, pathName } = url.parse(link);
  const fileName = hostName
    .concat(pathName)
    .replace(/\W+/g, '-')
    .concat('.html');
  const destPath = path.join(options.destination, fileName);
  return destPath;
};
