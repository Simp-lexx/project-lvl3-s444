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
  console.log(trimmedFileName);
  const normalizeFileName = fileName => fileName.replace(/\W+/g, '-');
  let newFileName = '';
  let newExt = '';
  if (extension) {
    newExt = extension;
    newFileName = normalizeFileName(trimmedFileName);
    console.log(newFileName);
  } else {
    newExt = path.extname(trimmedFileName);
    const fileNameWoExt = trimmedFileName.split(newExt)[0];
    newFileName = normalizeFileName(fileNameWoExt);
    console.log(newExt);
  }
  return newFileName.concat(newExt);
};

export const buildFilesArray = (html) => {
  const $ = cheerio.load(html);
  const filesArray = [];
  Object.keys(tagMap).forEach(tag => $(tag).each((i, elem) => {
    const link = $(elem).attr(tagMap[tag]);
    if (isFile(link)) filesArray.push(link);
  }));
  return filesArray;
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

export const updateLocalLinks = (html, dirName) => {
  const $ = cheerio.load(html);
  Object.keys(tagMap).forEach(tag => $(tag).map((i, elem) => {
    const link = $(elem).attr(tagMap[tag]);
    if (link && !url.parse(link).hostname && link[1] !== '/') {
      const newLink = `${dirName}/${formatName(link)}`;
      return $(elem).attr(tagMap[tag], newLink);
    }
    return '';
  }));
  return $.html();
};
