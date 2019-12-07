const uptobox = require('uptobox-api');
const argv = require('minimist')(process.argv.slice(2));
const filesize = require('filesize');
const {token, premium, xfss} = require('./config.js');

async function getList(options) {
    return uptobox.list(options).then(({data}) => !data.statusCode ? data.data : ({error: data.message}));
}

async function list() {
    let options = {
        token: token,
        path: argv.path || '//',
        limit: argv.limit || 100,
        offset: argv.offset || 0,
        orderBy: argv.order || 'file_name',
        dir: argv.dir || 'asc'
    };
    let list, type = argv.type || 'file';

    if (argv.search) {
        options['searchField'] = argv['search-field'] || 'file_name';
        options['search'] = argv.search;
    }

    let data = await getList(options);

    if (data.error){
        console.log(data.error);
        process.exit();
    }

    switch (type) {
        case 'file':
            list = data.files;

            if (!argv.limit) {
                let requests = [], loopLimit = data.pageCount - Math.ceil(options.offset / options.limit);

                for (let i = 0; i < loopLimit; i++) {
                    if ((data.currentFolder.fileCount - options.offset) < options.limit) continue;
                    options.offset += options.limit;
                    requests.push(getList(options));
                }

                let results = await Promise.all(requests)
                    .then(values =>
                        values.map(value => value.files)
                            .reduce((res, val) => res.concat(val), [])
                    );

                list.push(...results);
            }

            list = list.map(({file_name, file_public, file_password, file_descr, file_code, file_size}) => ({
                name: file_name,
                size: filesize(file_size),
                public: file_public,
                password: file_password,
                description: file_descr,
                file_code
            }));
            break;
        case 'folder':
            list = data.folders.map(({fld_id, fld_name, name}) => ({id: fld_id, name, path: fld_name}));
            break;
    }

    return list;
}

async function exportAll() {
    return uptobox.exportAll(token).then(({data}) => !data.statusCode ? data.data.map(data => ({...data, ['file_size']: filesize(data.file_size)})) : data.message);
}

async function addFile() {
    return uptobox.addFile(argv._[1], xfss).then(({data}) => data);
}

async function getUserData() {
    return uptobox.getUserData(token).then(({data}) => !data.statusCode ? data.data : data.message);
}

async function setSSL() {
    return uptobox.setSSL(token, argv._[1]).then(({data}) => data.message);
}

async function setDirectDL() {
    return uptobox.setDirectDL(token, argv._[1]).then(({data}) => data.message);
}

async function setSecurityLock() {
    return uptobox.setSecurityLock(token, argv._[1]).then(({data}) => data.message);
}

async function convertPoints() {
    return uptobox.convertPoints(token, argv._[1]).then(({data}) => !data.statusCode ? `You're now premium until ${data.data}` : data.message);
}

async function createVoucher() {
    return uptobox.createVoucher(token, argv._[1], argv._[2]).then(({data}) => !data.statusCode ? data.data : data.message);
}

async function getDownloadLink() {
    let options = {token, file_code: argv._[1]};

    if (!premium) {
        let {seconds, waitingToken} = await uptobox.getDownloadLink(options).then(({data: {data: {waiting, waitingToken}}}) => ({seconds: waiting, waitingToken}));
        options['waitingToken'] = waitingToken;

        process.stdout.write(`Wait ${seconds}s`);
        let interval = setInterval(() => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Wait ${seconds -= 1}s`);
        }, 1000);

        await new Promise(resolve => setTimeout(() => {
            clearInterval(interval);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            resolve();
        }, seconds*1000));
    }

    return uptobox.getDownloadLink(options).then(({data}) => !data.statusCode ? data.data.dlLink : data.message);
}

async function getStreamingLink() {
    let options = {token, file_code: argv._[1]};

    if (!premium) {
        options = await uptobox.getStreamingLink(options).then(({data: {data: {pin, checkHash}}}) => ({pin, check: checkHash}));
        await uptobox.validatePin(token, options.pin);
    }

    return uptobox.getStreamingLink(options).then(({data}) => !data.statusCode ? data.data.streamLinks : data.message);
}

async function updateFile() {
    return uptobox.updateFile({
        token,
        file_code: argv._[1],
        new_name: argv.name,
        public: argv.public,
        description: argv.desc,
        password: argv.passwd
    }).then(({data}) => !data.statusCode ? (data.data.updated ? `Updated` : 'Nothing to update') : data.message);
}

/*async function updateFiles() {
    let list = await this.list(), base_name = argv.name;

    for (const {name, file_code} of list) {
        let dynamic = name.match(new RegExp(argv.regexp));
        if (dynamic !== null && argv.regexp) {
            let extension = name.match(/\.\w+$/g)[0];
            argv.name = `${base_name} ${dynamic[0]}${extension}`;
            argv._[1] = file_code;
            console.log(await this.updateFile().then(data => `${data} : ${argv.name}`));
        }
    }

    return 'done';
}*/

async function updateFilesPublic() {
    return uptobox.updateFilesPublic(token, argv._[1], argv._[2])
        .then(({data}) => !data.statusCode ? (data.data.updated ? `Updated ${data.data.updated}` : 'Nothing to update') : data.message);
}

async function moveFolder() {
    return uptobox.moveFolder(token, argv._[1], argv._[2]).then(({data}) => data.message);
}

async function moveFiles() {
    return uptobox.moveFiles(token, argv._[1], argv._[2]).then(({data}) => !data.statusCode ? `Moved ${data.data.updated} files` : data.message);
}

async function copyFiles() {
    return uptobox.copyFiles(token, argv._[1], argv._[2]).then(({data}) => data.message);
}

async function renameFolder() {
    return uptobox.renameFolder(token, argv._[1], argv._[2]).then(({data}) => data.message);
}

async function createFolder() {
    return uptobox.createFolder(token, argv._[1], argv._[2]).then(({data}) => data.message);
}

async function deleteFiles() {
    return uptobox.deleteFiles(token, argv._[1]).then(({data}) => !data.statusCode ? `Deleted ${data.data.deleted} files` : data.message);
}

async function deleteFolder() {
    return uptobox.deleteFolder(token, argv._[1], argv.force).then(({data}) => data.message);
}

module.exports = { exportAll, addFile, getUserData, setSSL, setDirectDL, setSecurityLock, convertPoints, createVoucher, getDownloadLink, getStreamingLink, list, updateFile, updateFilesPublic, moveFolder, moveFiles, copyFiles, renameFolder, createFolder, deleteFiles, deleteFolder, premium };