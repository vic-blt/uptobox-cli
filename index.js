const commandName = process.argv.slice(2)[0];
const {premium} = require('./config.js');
const {[commandName]: command} = require('./functions.js');
const premiumFeatures = ['setSSL', 'setDirectDL', 'setSecurityLock'];

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
    exportAll
    addFile <file_code>
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
    deleteFiles <file_code1> <file_code2> ...
    deleteFolder <folder_id> [--force]\n`;

(async () => {
    if (!premium && premiumFeatures.includes(commandName)){
        console.log("Your account needs to be premium to request this endpoint.\nFor more details, go to https://docs.uptobox.com/");
        process.exit();
    }

    let result = command ? await command() : null;

    switch(commandName){
        case 'list':
        case 'exportAll':
            console.table(result);
            break;

        default:
            console.log(result || help);
            break;
    }
})();
