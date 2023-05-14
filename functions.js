const uptobox = require('uptobox-api')
const argv = require('minimist')(process.argv.slice(2))
const filesize = require('filesize')
const readline = require('readline')
const fs = require('fs')
const FormData = require('form-data')
const {token, premium} = require('./config.js')

async function getList(options) {
    return uptobox.list(options)
        .then(({statusCode, data, message}) => !statusCode ? data : new Error(message))
        .catch(error => error)
}

async function list() {
    let list = []
    let options = {
        token: token,
        path: argv.path || '//',
        limit: argv.limit || 100,
        offset: argv.offset || 0,
        orderBy: argv.order || 'file_name',
        dir: argv.dir || 'asc'
    }
    const type = argv.type || 'file'

    if (argv.search) {
        options['searchField'] = argv['search-field'] || 'file_name'
        options['search'] = argv.search
        options['exactSearch'] = argv.exactSearch
        options['currentFolderSearch'] = argv.currentFolderSearch
        options['oldSearch'] = argv.oldSearch
    }

    let data = await getList(options)

    if (data instanceof Error){
        return data
    }

    switch (type) {
        case 'file':
            list = data.files

            if (!argv.limit) {
                let requests = [], loopLimit = data.pageCount - Math.ceil(options.offset / options.limit)

                for (let i = 0; i < loopLimit; i++) {
                    if ((data.currentFolder.fileCount - options.offset) < options.limit) continue
                    options.offset += options.limit
                    requests.push(getList(options))
                }

                let results = await Promise.all(requests)
                    .then(values =>
                        values.map(value => value.files)
                            .reduce((res, val) => res.concat(val), [])
                    )

                list.push(...results)
            }

            list = list.map(({file_name, file_public, file_password, file_descr, file_created, file_code, file_size}) => ({
                name: file_name,
                size: filesize(file_size),
                public: file_public,
                password: file_password,
                description: file_descr,
                file_code,
                // TODO: feature: add file_created after console.table is replaced by another display system
            }))
            break
        case 'folder':
            list = data.folders.map(({fld_id, fld_name, name, hash}) => ({id: fld_id, name, path: fld_name, hash}))
            break
    }

    return list
}

async function exportAll() {
    return uptobox.exportAll(token)
        .then(({statusCode, data, message}) =>
            !statusCode
                ? data.map(details => ({...details, ['file_size']: filesize(details.file_size)}))
                : message
        )
        .catch(error => error)
}

async function addFile() {
    return uptobox.addFile(token, argv._[1])
        .then(({statusCode, data, message}) => !statusCode ? data : message)
        .catch(error => error)
}

async function getUserData() {
    return uptobox.getUserData(token)
        .then(({statusCode, data, message}) => !statusCode ? data : message)
        .catch(error => error)
}

async function setSSL() {
    return uptobox.setSSL(token, argv._[1])
        .then(({message}) => message)
        .catch(error => error)
}

async function setDirectDL() {
    return uptobox.setDirectDL(token, argv._[1])
        .then(({message}) => message)
        .catch(error => error)
}

async function setUptostreamMiniature() {
    return uptobox.setUptostreamMiniature(token, argv._[1])
        .then(({message}) => message)
        .catch(error => error)
}

async function setDeletionNotification() {
    return uptobox.setDeletionNotification(token, argv._[1])
        .then(({message}) => message)
        .catch(error => error)
}

async function setSecurityLock() {
    return uptobox.setSecurityLock(token, argv._[1])
        .then(({message}) => message)
        .catch(error => error)
}

async function convertPoints() {
    return uptobox.convertPoints(token, argv._[1])
        .then(({statusCode, data, message}) => !statusCode ? `You're now premium until ${data}` : message)
        .catch(error => error)
}

async function createVoucher() {
    return uptobox.createVoucher(token, argv._[1], argv._[2])
        .then(({statusCode, data, message}) => !statusCode ? data : message)
        .catch(error => error)
}

async function getDownloadLink() {
    let options = {token, file_code: argv._[1]}

    if (!premium) {
        let {seconds, waitingToken} = await uptobox.getDownloadLink(options)
            .then(({statusCode, data: {waiting, waitingToken}, message}) =>
                statusCode === 0 || statusCode === 16 // 0: Success or 16: Waiting needed
                    ? ({seconds: waiting+1, waitingToken})
                    : message
            )
            .catch(error => error)

        options['waitingToken'] = waitingToken

        let interval = setInterval(() => {
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(`Wait ${--seconds}s`)
        }, 1000)

        await new Promise(resolve => setTimeout(() => {
            clearInterval(interval)
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            resolve()
        }, seconds*1000))
    }

    return uptobox.getDownloadLink(options)
        .then(({statusCode, message, data}) => !statusCode ? data.dlLink : message)
        .catch(error => error)
}

async function getStreamingLink() {
    let options = {token, file_code: argv._[1]}

    if (!premium) {
        options = await uptobox.getStreamingLink(options)
            .then(({data: {pin, checkHash}}) => ({pin, check: checkHash}))
            .catch(error => error)

        await uptobox.validatePin(token, options.pin)
    }

    return uptobox.getStreamingLink(options)
        .then(({statusCode, data, message}) => !statusCode ? data.streamLinks : message)
        .catch(error => error)
}

async function updateFile() {
    return uptobox.updateFile({
        token,
        file_code: argv._[1],
        new_name: argv.name,
        public: argv.public,
        description: argv.desc,
        password: argv.passwd
    })
    .then(({statusCode, data, message}) =>
        !statusCode
            ? (data.updated ? `Updated` : 'Nothing to update')
            : message
    )
    .catch(error => error)
}

async function updateFilesPublic() {
    return uptobox.updateFilesPublic(token, argv._[1], argv._[2])
        .then(({statusCode, data, message}) =>
            !statusCode
                ? (data.updated ? `Updated ${data.updated}` : 'Nothing to update')
                : message
        )
        .catch(error => error)
}

async function moveFolder() {
    return uptobox.moveFolder(token, argv._[1], argv._[2])
        .then(({message}) => message)
        .catch(error => error)
}

async function moveFiles() {
    return uptobox.moveFiles(token, argv._[1], argv._[2])
        .then(({statusCode, data, message}) => !statusCode ? `Moved ${data.updated} files` : message)
        .catch(error => error)
}

async function copyFiles() {
    return uptobox.copyFiles(token, argv._[1], argv._[2])
        .then(({message}) => message)
        .catch(error => error)
}

async function renameFolder() {
    return uptobox.renameFolder(token, argv._[1], argv._[2])
        .then(({message}) => message)
        .catch(error => error)
}

async function createFolder() {
    return uptobox.createFolder(token, argv._[1], argv._[2])
        .then(({message}) => message)
        .catch(error => error)
}

async function deleteFiles() {
    return uptobox.deleteFiles(token, argv._.slice(1).join(','))
        .then(({statusCode, data, message}) => !statusCode ? `Deleted ${data.deleted} files` : message)
        .catch(error => error)
}

async function deleteFolder() {
    return uptobox.deleteFolder(token, argv._[1], argv.force)
        .then(({message}) => message)
        .catch(error => error)
}

async function uploadFiles() {
    let formData = new FormData()

    let uploadLink = await uptobox.getUploadUrl(token)
        .then(({statusCode, data, message}) => !statusCode ? data.uploadLink : new Error(message))
        .catch(error => error)

    if (uploadLink instanceof Error) {
        console.log(`Error at uptobox.getUploadUrl : ${uploadLink}`)
        process.exit()
    }

    for (let filePath of argv._.slice(1)) {
        formData.append('files', fs.createReadStream(filePath))
    }

    // TODO: fix: when uploading several files, the promise is resolved when the first file is uploaded and the remaining files aren't uploaded
    return uptobox.uploadFile(`https:${uploadLink}`, formData)
        .on('uploadProgress', ({percent, total}) => {
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(`Upload of ${filesize(total)} : ${(percent*100).toFixed(0)}%`)
        })
        .json()
        .then(({files}) => files)
        .catch(error => error)
}

async function getFilesDetails() {
    return uptobox.getFilesDetails(argv._.slice(1).join(','))
        .then(({statusCode, data, message}) =>
            !statusCode
                ? data.list.map(({file_name, file_code, file_size, available_uts, need_premium}) => ({
                    name: file_name,
                    size: filesize(file_size),
                    file_code,
                    uptostream: available_uts,
                    need_premium
                }))
                : message
        )
        .catch(error => error)
}

async function getPublicFolderContent() {
    return uptobox.getPublicFolderContent(argv._[1], argv._[2],argv.limit || 100,argv.offset || 0)
        .then(({statusCode, data, message}) => !statusCode ? data.list : message)
        .catch(error => error)
}

module.exports = { exportAll, addFile, getUserData, setSSL, setDirectDL, setSecurityLock, convertPoints, createVoucher, getDownloadLink, getStreamingLink, list, updateFile, updateFilesPublic, moveFolder, moveFiles, copyFiles, renameFolder, createFolder, deleteFiles, deleteFolder, uploadFiles, getFilesDetails, getPublicFolderContent, setUptostreamMiniature, setDeletionNotification }
