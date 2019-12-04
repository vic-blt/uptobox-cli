const functions = require('./functions.js');

const help = `uptobox-cli [command] <options>\n
    list
        --type <type>
        --path <path>
        --limit 1..100
        --offset <offset>
        --order 'file_name'|'file_size'|'file_created'|'file_downloads'|'transcoded'
        --dir 'asc'|'desc'
        --search <search_value>
        --search-field 'file_name'|'file_size'|'file_created'|'file_downloads'|'transcoded'
    getDownloadLink <file_code>
    getStreamingLink <file_code>
    getUserData
    addFile <uptobox_url>
    updateFile <file_code> 
        --name <new_name>
        --public 0|1
        --desc <description>
        --passwd <password>
    updateFilesPublic <file_codes> 0|1
    convertPoints <points>
    createVoucher <time> <quantity>
    setSSL 0|1
    setSecurityLock 0|1
    setDirectDL 0|1
    moveFolder <folder_id> <destination_folder_id>
    moveFiles <file_codes> <destination_folder_id>
    copyFiles <file_codes> <destination_folder_id>
    renameFolder <folder_id> <new_name>
    createFolder <path> <name>
    deleteFiles <file_codes>
    deleteFolder <folder_id>\n`;

(async () => {
    const premiumFeatures = ['setSSL', 'setDirectDL', 'setSecurityLock'];
    const command = process.argv.slice(2)[0];

    if (!functions.premium && premiumFeatures.includes(command)){
        console.log("Your account needs to be premium to request this endpoint.\nFor more details, go to https://docs.uptobox.com/");
        process.exit();
    }

    let result = functions[command] ? await functions[command]() : null;

    switch(command){
        case 'list':
            console.table(result);
            break;

        default:
            console.log(result || help);
            break;
    }
})();
