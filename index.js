// Modules
const uptobox = require('uptobox-api');
const filesize = require('filesize');
const argv = require('minimist')(process.argv.slice(2));

// Constants
const token = require('./token');
const xfss = require('./xfss');

class Uptobox {
    constructor() {
        this.isPremium = 0;
        this.help = `Choose a valid command :\n
            listFiles
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
            updateFilesPublic 0|1 <file_codes>
            convertPoints <points>
            createVoucher <time> <quantity>
            setSSL 0|1
            setSecurityLock 0|1
            setDirectDL 0|1`;
    }

    async init() { return this.isPremium = (await this.getUserData()).premium }

    async listFiles() {
        let options = {
            token: token,
            path: argv.path || '//',
            limit: argv.limit || 100,
            offset: argv.offset || 0,
            orderBy: argv.order || 'file_name',
            dir: argv.dir || 'asc'
        };

        if (argv.search) {
            options['searchField'] = argv['search-field'] || 'file_name';
            options['search'] = argv.search;
        }

        let data = await this.getList(options);
        let files = data.files;
        let loopLimit = data.pageCount - Math.ceil(options.offset / options.limit);

        if (!argv.limit) {
            let requests = [];

            for (let i = 0; i < loopLimit; i++) {
                if ((data.currentFolder.fileCount - options.offset) < options.limit) continue;
                options.offset += options.limit;
                requests.push(this.getList(options));
            }

            let results = await Promise.all(requests)
                .then(values =>
                    values.map(value => value.files)
                        .reduce((res, val) => res.concat(val), [])
                );

            files.push(...results);
        }

        return files;
    }

    async addFile() { return uptobox.addFile(`${argv._[1]}?add-to-account`, `xfss=${xfss}`).then(({data}) => data) }

    // https://docs.uptobox.com/?javascript#retrieve-files-and-folders
    async getList(options) { return uptobox.list(options).then(({data}) => data.data) };

    // https://docs.uptobox.com/?javascript#retrieve-user-data
    async getUserData() { return uptobox.getUserData(token).then(({data}) => !data.statusCode ? data.data : data.message) }

    // https://docs.uptobox.com/?javascript#ssl-download
    async setSSL() { return uptobox.setSSL(token, argv._[1]).then(({data}) => data.message) }

    // https://docs.uptobox.com/?javascript#direct-download
    async setDirectDL() { return uptobox.setDirectDL(token, argv._[1]).then(({data}) => data.message) }

    // https://docs.uptobox.com/?javascript#security-lock
    async setSecurityLock() { return uptobox.setSecurityLock(token, argv._[1]).then(({data}) => data.message) }

    // https://docs.uptobox.com/?javascript#point-conversion
    async convertPoints() { return uptobox.convertPoints(token, argv._[1]).then(({data}) => !data.statusCode ? `You're now premium until ${data.data}` : data.message) }

    // https://docs.uptobox.com/?javascript#create-voucher
    async createVoucher() { return uptobox.createVoucher(token, argv.time, argv.quantity).then(({data}) => !data.statusCode ? data.data : data.message) }

    // https://docs.uptobox.com/?javascript#generate-a-download-link
    async getDownloadLink() {
        let options = {token, file_code: argv._[1]};

        if (!this.isPremium) {
            let {seconds, waitingToken} = (await uptobox.getDownloadLink(options)).data;
            options['waitingToken'] = waitingToken;
            await new Promise(resolve => setTimeout(resolve, seconds));
        }
        return uptobox.getDownloadLink(options).then(({data}) => !data.statusCode ? data.data.dlLink : data.message);
    }

    // https://docs.uptobox.com/?javascript#get-a-pin
    async getStreamingLink() {
        let options = {token, file_code: argv._[1]};

        if (!this.isPremium) {
            let {pin, checkHash} = (await uptobox.getStreamingLink(options)).data;
            options = {pin, checkHash};
        }
        return uptobox.getStreamingLink(options).then(({data}) => !data.statusCode ? data.data.streamLinks : data.message);
    }

    // https://docs.uptobox.com/?javascript#update-file-informations
    async updateFile() {
        let options = {
            token,
            file_code: argv.id,
            new_name: argv.name,
            public: argv.public,
            description: argv.desc,
            password: argv.passwd
        };

        return uptobox.updateFileProperties(options).then(({data}) => !data.statusCode ? (data.data.updated ? `Updated` : 'Nothing to update') : data.message);
    }

    // https://docs.uptobox.com/?javascript#update-multiple-file-39-s-public-option
    async updateFilesPublic() {
        return uptobox.updateFilesPublicProperty(token, argv.ids, argv.public)
            .then(({data}) => !data.statusCode ? (data.data.updated ? `Updated ${data.data.updated}` : 'Nothing to update') : data.message)
    }
}

(async () => {
    let upto = new Uptobox();
    await upto.init();
    const premiumFeatures = ['setSSL', 'setDirectDL', 'setSecurityLock'];

    if (!upto.isPremium && premiumFeatures.includes(argv._[0])){
        console.log("Your account needs to be premium to request this endpoint.\nFor more details, go to https://docs.uptobox.com/");
        process.exit();
    }

    let result = upto[argv._[0]] ? await upto[argv._[0]]() : upto.help;

    switch(argv._[0]){
        case 'listFiles':
            console.table(
                result.map(({file_name, file_code, file_size}) => ({
                    name: `${file_name} (${filesize(file_size)})`,
                    file_code: file_code
                })
            ));
            break;

        default:
            console.log(result);
            break;
    }
})();
