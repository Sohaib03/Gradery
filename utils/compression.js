const adm = require("adm-zip");

async function createZipArchive(fileList) {
	const zip = new adm();
	const outputFile = "temp/temp_" + new Date().getTime() + ".zip";
    console.log(outputFile)
	for (let i = 0; i < fileList.length; i++) {
		await zip.addLocalFile(fileList[i]);
	}
	await zip.writeZip(outputFile);
	return outputFile;
}

module.exports = {
	createZipArchive,
};
