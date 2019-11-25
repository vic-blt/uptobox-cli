const uptobox = require('uptobox-api');
const filesize = require('filesize');
const constants = require('./constants');
const token = require('./token');
const xfss = require('./xfss');
const args = process.argv.slice(2);

let setListOptions = params => {
    let options = {
        token: token,
        path: params.path || '//',
        limit: params.limit || 100,
        offset: params.offset || 0,
        orderBy: params.orderBy || 'file_name',
        dir: params.dir || 'asc'
    };

    if (params.search){
        options['searchField'] = params.searchField || 'file_name';
        options['search'] = params.search;
    }

    return options;
}

let listFiles = async (options) => {
    let data = await getList(options);
    let files = data.files;

    if (data.pageCount > 1){
        let requests = [];

        for (let i = 1; i < data.pageCount; ++i){
            options.offset = i*100;
            requests.push(getList(options));
        }

        let results = await Promise.all(requests)
            .then(values =>
                values.map(value => value.files)
                    .reduce((res, val) => res.concat(val), [])
            );

        files.push(...results);
    }

    console.table(files.map(({file_name, file_code, file_size}) => ({name: `${file_name} (${filesize(file_size)})`, file_code: file_code})));

    return files;
}

let getList = async options => (await uptobox.listFiles(options)).data.data;

(async () => {
    let options = {token: token}, response;

    switch (args[0]) {

        case 'add':
            options = {
                xfss: `xfss=${xfss}`,
                url: `${args[1]}?add-to-account`
            };
            console.log((await uptobox.addFile(options)).data);
            break;

        case 'getAccount':
            console.log((await uptobox.getAccount(token)).data);
            break;

        case 'setSSL':
            options['is_ssl'] = args[1];
            console.log((await uptobox.setSSL(options)).data);
            break;

        case 'setDirectDL':
            options['is_direct'] = args[1];
            console.log((await uptobox.setDirectDL(options)).data);
            break;

        case 'convertPoints':
            options['points'] = args[1];
            console.log((await uptobox.convertPoints(options)).data);
            break;

        case 'getDownloadLink':
            options['file_code'] = args[1];
            response = (await uptobox.getDownloadLink(options)).data;
            console.log(response.statusCode === 0 ? response.data.dlLink : response.message);
            break;

        case 'getStreamingLink':
            options['file_code'] = args[1];
            response = (await uptobox.getStreamingLink(options)).data;
            console.log(response.statusCode === 0 ? response.data.streamLinks : response.message);
            break;

        case 'search':
            await listFiles(setListOptions({search: args[1]}));
            break;

        case 'list':
            await listFiles(setListOptions({path: constants.paths[args[1]]}));
            break;

        case 'update':
            options = {
                ...options,
                file_code: args[1],
                new_name: args[2],
                is_public: args[3],
                description: args[4],
                password: args[5]
            };
            response = (await uptobox.updateFileProperties(options)).data;
            console.log(response.statusCode === 0 ? (response.data.updated ? 'Updated' : 'Nothing to update') : response.message);
            break;

        default:
            console.log(
                `Choose a valid command :
                search <file_name>
                list <folder_name>
                getDownloadLink <file_code>
                getStreamingLink <file_code>
                getAccount
                add <uptobox_url>
                update <file_code> <new_name> <is_public>
                convertPoints <points>
                setSSL 0|1
                setSecurityLock 0|1
                setDirectDL 0|1`
            );
            break;
    }
})()
