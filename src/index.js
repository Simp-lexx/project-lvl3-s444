import fs from 'fs';
import path from 'path';
import parser from './parsers';
import buildDiffTree from './buildAstTree';
import render from './renderers';

const readParseFile = (pathFile) => {
  const getRelFilePath = path.relative('', pathFile);
  const getFileExtension = path.extname(pathFile);
  return { content: fs.readFileSync(getRelFilePath, 'utf-8'), ext: getFileExtension };
};

const gendiff = (pathFile1, pathFile2, format) => {
  const data1 = readParseFile(pathFile1);
  const data2 = readParseFile(pathFile2);
  const obj1 = parser(data1.ext, data1.content);
  const obj2 = parser(data2.ext, data2.content);
  return render(buildDiffTree(obj1, obj2), format);
};

export default gendiff;
