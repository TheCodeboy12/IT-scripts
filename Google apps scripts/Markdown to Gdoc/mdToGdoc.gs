const FOLDER_ID = ''; //Where the unmodified files are stored
const OUT_FOLDER_ID = 'YOUR OUTPUT FOLDER ID'; //Where to output the modified md files
const MIME_TYPE = 'text/markdown';
const REGEX = '!\\[([^\\]]*)\\]\\(([^)]*?\\/([^/]+?\\.(?:png|jpg|jpeg|gif|webp|svg)|[^)]*?\\/([^`\\`]+))\\))';
const ORIGI_REGEX = "!\[([^\]]*)\]\(([^)]*?\/([^/]+?\.(?:png|jpg|jpeg|gif|webp|svg)|[^)]*?\/([^`\`]+))\))"
const REGEX_FLAVOR = "g"
const DIRECT_IMAGE_URL_TEMPLATE = 'https://lh3.googleusercontent.com/d/';


function findAndReplaceLinks(str, fileFolderId) {
  // copy the iterator so we can always summon it.
  const fileFolder = DriveApp.getFolderById(fileFolderId);
  const regex = RegExp(REGEX, REGEX_FLAVOR);
  let newStr = str;
  let match;
  while ((match = regex.exec(str)) !== null) {
    // const fileFolderCopy = fileFolder; 

    //get the folder iterator


    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    const fullLinkString = match[0];
    const altName = match[1];
    const imageUrl = match[2];
    const fileName = decodeURI(match[3]);

    //try to find the file by its nama in the file folder
    const imageFile = fileFolder.getFilesByName(fileName);
    // if found - we get the file Id
    if (!imageFile.hasNext())
      continue;
    // const imageFileId = imageFile.next().getId();
    const imageFileId = imageFile.next().getId();
    // create the URL 
    const newUrl = DIRECT_IMAGE_URL_TEMPLATE + imageFileId;



    newStr = newStr.replace(imageUrl, (newUrl+')'));

  }
  console.log(newStr);
  return newStr;
};







function main() {
  const folder = DriveApp.getFolderById(FOLDER_ID);

  const files = folder.getFilesByType(MIME_TYPE);
  do {
    const file = files.next();
    const fileName = file.getName();
    const strippedFileName = fileName.split('.md')[0];
    const fileFolder = folder.getFoldersByName(strippedFileName);
    // check if there is a folder with the file name. (this means that the file has some assets).
    if (fileFolder.hasNext()) { 
      const fileFolderId = fileFolder.next().getId();
      const blob = file.getBlob();
      const textContent = blob.getDataAsString();
      console.log(textContent);

      // do all the magic
      const newContent = findAndReplaceLinks(textContent, fileFolderId);
      blob.setDataFromString(newContent);

      const outFolder = DriveApp.getFolderById(OUT_FOLDER_ID);
      const newfile = outFolder.createFile(blob);
    }
  } while (files.hasNext())
}


