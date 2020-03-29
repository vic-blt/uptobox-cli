# Uptobox CLI

## Requirements

- **Node.js**
- **NPM**

## Setup

- Create a `config.js` file in the same folder than `index.js`
  ```js
  module.exports = {
      token: '<YOUR_API_TOKEN>',
      premium: 0,
      xfss: '<XFSS_SESSION_COOKIE>'
  };
  ```
  - `token`: Your uptobox account's token ([How to find my API token ?](https://docs.uptobox.com/#how-to-find-my-api-token)).
  - `premium`: `1` if you have a premium account, else `0`.
  - `xfss`: The XFSS cookie, it's only required for `addFile` command.

- Install dependencies : `npm install`

## Usage

#### Commands : 

- `list`\
  **Options:**
  - `--type <type>`\
    Values are `'file'` or `'folder'`.\
    **Default:** `'file'`.
  - `--path <path>`\
    Needs to be prefixed by a double slash, e.g., `'//Movies'`.\
    **Default:** `'//'` (root path).
  - `--limit <limit>`\
    Number of files to retrieve, from `1` to `100`.\
    **Default:** `100`.
  - `--offset <offset>`\
    Retrieve from the specified offset.\
    **Default:** `0`.
  - `--order <column_name>`\
    Sort the result by one of these column names :\
    `file_name`, `file_size`, `file_created`, `file_downloads` or `transcoded`.\
    **Default:** `file_name`.
  - `--dir 'asc'|'desc'`\
    Sort direction.\
    **Default:** `'asc'`.
  - `--search <search_value>`\
    Case insensitive search. `<search_value>` can be a partial filename.
  - `--search-field <column_name>`\
    See `--order` for `<column_name>` value.

- `getDownloadLink <file_code>`
  
- `getStreamingLink <file_code>`\
  If the file is available through Uptostream, it returns a list of links for the different resolutions and languages available.

- `getUserData`

- `exportAll`

- `addFile <uptobox_url>`\
  Until there's a dedicated API endpoint for this feature, this will **ONLY** work if you log in your Uptobox account, retrieve the XFSS cookie and **KEEP** your session active (don't log out). Then save the XFSS value in the file `config.js`.\
  The XFSS cookie expiration is set to 1 year.\
  A simple `ok` is returned if it was successfully added to your account.

- `updateFile <file_code>`\
  **Options:**
  - `--name <new_name>`\
    New file name value.
  - `--public 0|1`\
    New public status.
  - `--desc <description>`\
    New description value.
  - `--passwd <password>`\
    New password value.

- `updateFilesPublic <file_codes> <public>`\
  File codes have to be separated by commas, e.g., `'uuuuuuuuuu,uuuuuuuuuu'`.

- `convertPoints <points>`\
  Exchange your UTB points in premium days.

- `createVoucher <time> <quantity>`\
  `<time>` needs to be one of these values : `'30d'`, `'365d'` or `'730d'`.

- `setSSL 0|1` (**Requires an Uptobox premium account**)\
  Force `https` protocol for downloading.

- `setSecurityLock 0|1` (**Requires an Uptobox premium account**)\
  Enforce your account safety by preventing login from another country.

- `setDirectDL 0|1` (**Requires an Uptobox premium account**)\
  Automatically triggers the download when reaching an Uptobox link.

- `moveFolder <folder_id> <destination_folder_id>`

- `moveFiles <file_codes> <destination_folder_id>`

- `copyFiles <file_codes> <destination_folder_id>`

- `renameFolder <folder_id> <new_name>`

- `createFolder <path> <name>`

- `deleteFiles <file_code1> <file_code2> ...`

- `deleteFolder <folder_id>`\
  If the folder is not empty, an error will be thrown.\
  If you really want to delete a folder even if **it's NOT empty**, use the `--force` option.


## Dependencies

- [filesize](https://www.npmjs.com/package/filesize)
- [uptobox-api](https://www.npmjs.com/package/uptobox-api)
- [minimist](https://www.npmjs.com/package/minimist)
