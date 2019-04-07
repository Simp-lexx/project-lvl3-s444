import url from 'url';
import path from 'path';
import cheerio from 'cheerio';
import _ from 'lodash';

const tagMap = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const isFile = (link) => {
  if (!link) {
    return false;
  }
  const { hostname } = url.parse(link);
  return !hostname && link[1] !== '/';
};

export const formatName = (baseUrl, extension) => {
  const { hostname, pathname } = url.parse(baseUrl);
  const baseFileName = url.format({ hostname, pathname });
  const trimmedFileName = _.trim(baseFileName, '/');
  const normalizeFileName = fileName => fileName.replace(/\W/g, '-');

  let newFileName = '';
  let newExt = '';

  if (extension) {
    newExt = extension;
    newFileName = normalizeFileName(trimmedFileName);
  } else {
    newExt = path.extname(trimmedFileName);
    const fileNameWoExt = trimmedFileName.split(newExt)[0];
    newFileName = normalizeFileName(fileNameWoExt);
  }
  return newFileName.concat(newExt);
};

export const getDirectLinks = (links, baseUrl) => {
  const { protocol, host, pathname } = url.parse(baseUrl);
  return links.map((link) => {
    if (link[0] === '/') {
      return url.format({ protocol, host, pathname: link });
    }
    return url.format({ protocol, host, pathname: `${pathname}${link}` });
  });
};

// export const makeLocalResources = (html, dirName) => {
//   const $ = cheerio.load(html);
//   const fileNames = [];
//   Object.keys(tagMap).forEach(tag => $(tag).map((i, elem) => {
//     const fileName = $(elem).attr(tagMap[tag]);
//     if (isFile(fileName)) {
//       fileNames.push(fileName);
//       const newLink = `${dirName}/${formatName(fileName)}`;
//       return $(elem).attr(tagMap[tag], newLink);
//     }
//     return '';
//   }));
//   return { localHtmlWithLinks: $.html(), localFileNames: fileNames };
// };

export const makeLocalResources = (html, dirName) => {
  const $ = cheerio.load(html);
  const fileNames = [];
  Object.keys(tagMap).forEach(tag => $(tag)
    .filter((i, elem) => {
      const fileName = $(elem).attr(tagMap[tag]);
      return isFile(fileName);
    })
    .each((i, elem) => {
      const fileName = $(elem).attr(tagMap[tag]);
      fileNames.push(fileName);
      const newLink = `${dirName}/${formatName(fileName)}`;
      return $(elem).attr(tagMap[tag], newLink);
    }));
  return { localHtmlWithLinks: $.html(), localFileNames: fileNames };
};
